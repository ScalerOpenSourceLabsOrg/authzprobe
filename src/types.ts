/**
 * Core domain types shared across AuthzProbe.
 *
 * The pipeline is: OpenAPI spec  ->  SpecOperation[]  (spec/parse.ts)
 *                  config + spec ->  TestCase[]        (engine/plan.ts)
 *                  TestCase      ->  ReplayResult      (engine/replay.ts)
 *                  ReplayResult  ->  Evaluation        (engine/evaluate.ts)
 */

export type HttpMethod =
  | 'get'
  | 'put'
  | 'post'
  | 'delete'
  | 'patch'
  | 'head'
  | 'options'
  | 'trace';

/** A single operation extracted from an OpenAPI document. */
export interface SpecOperation {
  /** operationId if the spec declares one, otherwise undefined. */
  operationId?: string;
  method: HttpMethod;
  /** Templated path, e.g. `/users/{userId}/orders/{orderId}`. */
  path: string;
  summary?: string;
  /** Names of path parameters, e.g. `["userId", "orderId"]`. */
  pathParams: string[];
  /** Names of query parameters. */
  queryParams: string[];
  /** True if the operation (or the spec globally) declares a security scheme. */
  hasSecurity: boolean;
  /** True for read-only verbs (GET, HEAD). Mutations are gated behind a flag. */
  isSafe: boolean;
}

/**
 * The kind of authorization weakness a test case probes.
 * - BOLA: Broken Object Level Authorization — one user reads another user's object.
 * - BFLA: Broken Function Level Authorization — a user invokes a function they lack the role for.
 * - BASELINE: a sanity check that an identity CAN reach its own resource (catches setup mistakes).
 */
export type TestKind = 'BOLA' | 'BFLA' | 'BASELINE';

/** What we expect the server to do for a given test. */
export type Expectation = 'deny' | 'allow';

/** A concrete, replayable request derived from an operation + the identity config. */
export interface TestCase {
  id: string;
  kind: TestKind;
  operation: SpecOperation;
  /** Identity performing the request (the "attacker" for BOLA/BFLA). */
  actor: string;
  /** Identity that legitimately owns the target resource (BOLA only). */
  victim?: string;
  /** Resolved path parameter values, keyed by parameter name. */
  pathValues: Record<string, string>;
  /** Resolved query parameter values, keyed by parameter name. */
  queryValues: Record<string, string>;
  /** Human-readable description shown in the report. */
  description: string;
  /** What a correctly-secured server should do. */
  expectation: Expectation;
}

/** The outcome of actually sending a TestCase's request (or a dry-run plan). */
export interface ReplayResult {
  testCase: TestCase;
  /** The request line actually sent, e.g. `GET https://api/users/bob-456`. */
  requestLine: string;
  /** HTTP status returned, or null on transport error / dry-run. */
  status: number | null;
  /** Populated when the request could not be sent at all. */
  error?: string;
  durationMs: number;
}

/** Verdict for a single test after comparing expectation vs. actual status. */
export type Verdict = 'PASS' | 'FAIL' | 'INCONCLUSIVE' | 'WARN';

export interface Evaluation {
  result: ReplayResult;
  verdict: Verdict;
  /** One-line explanation, e.g. "expected deny, server returned 200 (BOLA)". */
  reason: string;
}
