import type { Config } from '../config/schema.js';
import type { Evaluation, ReplayResult, Verdict } from '../types.js';

/**
 * Compare what a correctly-secured server SHOULD have done against what it
 * actually did, and assign a verdict.
 *
 * Verdicts:
 *   FAIL         — a vulnerability: a request that should have been denied returned 2xx.
 *   PASS         — the server behaved correctly (denied a deny-case, allowed a baseline).
 *   WARN         — a baseline self-access request did NOT succeed; likely bad creds or
 *                  ownership mapping, which would make BOLA results untrustworthy.
 *   INCONCLUSIVE — transport error, or an unexpected status (e.g. 500) we can't judge.
 */
export function evaluate(result: ReplayResult, config: Config): Evaluation {
  const { status, error, testCase } = result;

  if (error || status === null) {
    return {
      result,
      verdict: 'INCONCLUSIVE',
      reason: error ? `request failed: ${error}` : 'no response (dry-run?)',
    };
  }

  const denied = config.denyStatuses.includes(status);
  const allowed = status >= 200 && status < 300;

  if (testCase.expectation === 'deny') {
    if (allowed) {
      return {
        result,
        verdict: 'FAIL',
        reason: `expected deny, server returned ${status} (${testCase.kind})`,
      };
    }
    if (denied) {
      return { result, verdict: 'PASS', reason: `correctly denied with ${status}` };
    }
    return {
      result,
      verdict: 'INCONCLUSIVE',
      reason: `expected deny, got unexpected ${status}`,
    };
  }

  // expectation === 'allow' (baseline)
  if (allowed) {
    return { result, verdict: 'PASS', reason: `own resource reachable (${status})` };
  }
  return {
    result,
    verdict: 'WARN',
    reason: `baseline self-access returned ${status}; check credentials / ownership mapping`,
  };
}

export function evaluateAll(results: ReplayResult[], config: Config): Evaluation[] {
  return results.map((r) => evaluate(r, config));
}

/** Aggregate counts, handy for the summary line and CI exit code. */
export function summarize(evaluations: Evaluation[]): Record<Verdict, number> {
  const counts: Record<Verdict, number> = {
    PASS: 0,
    FAIL: 0,
    WARN: 0,
    INCONCLUSIVE: 0,
  };
  for (const e of evaluations) counts[e.verdict]++;
  return counts;
}
