import type { Auth, Config, Identity } from '../config/schema.js';
import type { ReplayResult, TestCase } from '../types.js';
import { signature } from './plan.js';

export interface ReplayOptions {
  /** Don't send anything — just record the request that WOULD be sent. */
  dryRun: boolean;
  /** Per-request timeout in milliseconds. */
  timeoutMs: number;
}

const DEFAULT_REPLAY_OPTIONS: ReplayOptions = {
  dryRun: false,
  timeoutMs: 10_000,
};

/** Replay a single test case against the live server (or plan it, in dry-run). */
export async function replay(
  testCase: TestCase,
  config: Config,
  options: Partial<ReplayOptions> = {},
): Promise<ReplayResult> {
  const opts = { ...DEFAULT_REPLAY_OPTIONS, ...options };
  const identity = findIdentity(config, testCase.actor);
  const url = buildUrl(config.baseUrl, testCase);
  const requestLine = `${testCase.operation.method.toUpperCase()} ${url}`;

  if (opts.dryRun) {
    return { testCase, requestLine, status: null, durationMs: 0 };
  }

  const headers = authHeaders(identity.auth);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  const started = performance.now();

  try {
    const res = await fetch(url, {
      method: testCase.operation.method.toUpperCase(),
      headers,
      signal: controller.signal,
    });
    return {
      testCase,
      requestLine,
      status: res.status,
      durationMs: Math.round(performance.now() - started),
    };
  } catch (err) {
    const message = controller.signal.aborted
      ? `timed out after ${opts.timeoutMs}ms`
      : (err as Error).message;
    return {
      testCase,
      requestLine,
      status: null,
      error: message,
      durationMs: Math.round(performance.now() - started),
    };
  } finally {
    clearTimeout(timer);
  }
}

/** Replay many test cases with a bounded concurrency pool. */
export async function replayAll(
  cases: TestCase[],
  config: Config,
  options: Partial<ReplayOptions> & { concurrency?: number } = {},
): Promise<ReplayResult[]> {
  const concurrency = Math.max(1, options.concurrency ?? 5);
  const results: ReplayResult[] = new Array(cases.length);
  let cursor = 0;

  async function worker(): Promise<void> {
    while (cursor < cases.length) {
      const index = cursor++;
      results[index] = await replay(cases[index]!, config, options);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, cases.length) }, worker));
  return results;
}

function findIdentity(config: Config, name: string): Identity {
  const identity = config.identities.find((i) => i.name === name);
  if (!identity) throw new Error(`Unknown identity "${name}" referenced in a test case.`);
  return identity;
}

/** Substitute path params and append query string. */
export function buildUrl(baseUrl: string, testCase: TestCase): string {
  const path = testCase.operation.path.replace(/\{([^}]+)\}/g, (_m, name: string) => {
    const value = testCase.pathValues[name];
    if (value === undefined) {
      throw new Error(`Missing path value "${name}" for ${signature(testCase.operation)}`);
    }
    return encodeURIComponent(value);
  });

  const base = baseUrl.replace(/\/+$/, '');
  const url = new URL(base + path);
  for (const [key, value] of Object.entries(testCase.queryValues)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

/** Translate an identity's auth config into request headers. */
export function authHeaders(auth: Auth): Record<string, string> {
  switch (auth.type) {
    case 'bearer':
      if (!auth.token) throw new Error('bearer auth requires a "token".');
      return { Authorization: `Bearer ${auth.token}` };
    case 'header':
      if (!auth.header || auth.value === undefined) {
        throw new Error('header auth requires "header" and "value".');
      }
      return { [auth.header]: auth.value };
    case 'basic': {
      if (auth.username === undefined || auth.password === undefined) {
        throw new Error('basic auth requires "username" and "password".');
      }
      const encoded = Buffer.from(`${auth.username}:${auth.password}`).toString('base64');
      return { Authorization: `Basic ${encoded}` };
    }
  }
}
