import Table from 'cli-table3';
import pc from 'picocolors';
import type { Evaluation, Verdict } from '../types.js';
import { summarize } from '../engine/evaluate.js';

const VERDICT_COLOR: Record<Verdict, (s: string) => string> = {
  PASS: pc.green,
  FAIL: pc.red,
  WARN: pc.yellow,
  INCONCLUSIVE: pc.gray,
};

/** Human-readable table + summary printed to stdout. */
export function printReport(evaluations: Evaluation[], opts: { dryRun: boolean }): void {
  const table = new Table({
    head: ['Verdict', 'Kind', 'Request', 'Status', 'Detail'].map((h) => pc.bold(h)),
    style: { head: [], border: [] },
    colWidths: [8, 10, 46, 8, 40],
    wordWrap: true,
  });

  // Findings first (FAIL, then WARN), then the rest — the important rows lead.
  const ordered = [...evaluations].sort(
    (a, b) => rank(a.verdict) - rank(b.verdict),
  );

  for (const e of ordered) {
    const color = VERDICT_COLOR[e.verdict];
    table.push([
      color(e.verdict),
      e.result.testCase.kind,
      e.result.requestLine,
      e.result.status === null ? '—' : String(e.result.status),
      e.reason,
    ]);
  }

  console.log(table.toString());

  const counts = summarize(evaluations);
  const summary = [
    pc.red(`${counts.FAIL} FAIL`),
    pc.yellow(`${counts.WARN} WARN`),
    pc.green(`${counts.PASS} PASS`),
    pc.gray(`${counts.INCONCLUSIVE} inconclusive`),
  ].join('  ·  ');

  console.log('\n' + pc.bold('Summary: ') + summary);

  if (opts.dryRun) {
    console.log(pc.gray('\n(dry-run — no requests were sent)'));
    return;
  }

  if (counts.FAIL > 0) {
    console.log(
      pc.red(pc.bold(`\n✖ ${counts.FAIL} authorization ${plural(counts.FAIL, 'finding')} detected.`)),
    );
  } else {
    console.log(pc.green(pc.bold('\n✔ No authorization findings.')));
  }
}

/** Machine-readable report for CI pipelines and dashboards. */
export function toJson(evaluations: Evaluation[]): string {
  const findings = evaluations.map((e) => ({
    verdict: e.verdict,
    kind: e.result.testCase.kind,
    actor: e.result.testCase.actor,
    victim: e.result.testCase.victim ?? null,
    request: e.result.requestLine,
    status: e.result.status,
    expectation: e.result.testCase.expectation,
    reason: e.reason,
    description: e.result.testCase.description,
    durationMs: e.result.durationMs,
  }));
  return JSON.stringify({ summary: summarize(evaluations), findings }, null, 2);
}

function rank(v: Verdict): number {
  return { FAIL: 0, WARN: 1, INCONCLUSIVE: 2, PASS: 3 }[v];
}

function plural(n: number, word: string): string {
  return n === 1 ? word : `${word}s`;
}
