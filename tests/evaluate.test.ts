import { describe, it, expect } from 'vitest';
import { evaluate } from '../src/engine/evaluate.js';
import type { Config } from '../src/config/schema.js';
import type { ReplayResult, TestCase, SpecOperation } from '../src/types.js';

const config: Config = {
  baseUrl: 'http://x',
  denyStatuses: [401, 403, 404],
  privileged: [],
  identities: [
    { name: 'a', auth: { type: 'bearer', token: 't' }, owns: {} },
    { name: 'b', auth: { type: 'bearer', token: 't' }, owns: {} },
  ],
};

const op: SpecOperation = {
  method: 'get',
  path: '/users/{userId}',
  pathParams: ['userId'],
  queryParams: [],
  hasSecurity: true,
  isSafe: true,
};

function tc(kind: TestCase['kind'], expectation: TestCase['expectation']): TestCase {
  return {
    id: 'x',
    kind,
    operation: op,
    actor: 'a',
    victim: 'b',
    pathValues: { userId: 'b-1' },
    queryValues: {},
    description: 'd',
    expectation,
  };
}

function result(testCase: TestCase, status: number | null, error?: string): ReplayResult {
  return { testCase, requestLine: 'GET http://x/users/b-1', status, error, durationMs: 1 };
}

describe('evaluate', () => {
  it('flags a deny-case that returned 200 as FAIL', () => {
    const e = evaluate(result(tc('BOLA', 'deny'), 200), config);
    expect(e.verdict).toBe('FAIL');
    expect(e.reason).toContain('BOLA');
  });

  it('passes a deny-case that returned 403', () => {
    expect(evaluate(result(tc('BOLA', 'deny'), 403), config).verdict).toBe('PASS');
  });

  it('marks an unexpected 500 on a deny-case as INCONCLUSIVE', () => {
    expect(evaluate(result(tc('BOLA', 'deny'), 500), config).verdict).toBe('INCONCLUSIVE');
  });

  it('passes a baseline that returned 200', () => {
    expect(evaluate(result(tc('BASELINE', 'allow'), 200), config).verdict).toBe('PASS');
  });

  it('warns when a baseline self-access is denied', () => {
    expect(evaluate(result(tc('BASELINE', 'allow'), 403), config).verdict).toBe('WARN');
  });

  it('is inconclusive on transport error', () => {
    expect(evaluate(result(tc('BOLA', 'deny'), null, 'ECONNREFUSED'), config).verdict).toBe('INCONCLUSIVE');
  });
});
