#!/usr/bin/env node
import { writeFile } from 'node:fs/promises';
import { Command } from 'commander';
import pc from 'picocolors';
import { scan } from './engine/run.js';
import { parseOnlyFilter } from './engine/plan.js';
import { printReport, toJson } from './report/report.js';
import { summarize } from './engine/evaluate.js';

const program = new Command();

program
  .name('authzprobe')
  .description(
    'Spec-driven API authorization tester. Replays requests cross-identity to catch\nBOLA & BFLA (OWASP API Security Top 10) that spec linters cannot see.',
  )
  .version('0.1.0');

program
  .command('scan')
  .description('Run an authorization scan against a live API described by an OpenAPI spec.')
  .requiredOption('-s, --spec <path>', 'path or URL to the OpenAPI spec')
  .requiredOption('-c, --config <path>', 'path to the identity/resource mapping config (YAML)')
  .option('-b, --base-url <url>', 'override the baseUrl declared in the config')
  .option('--dry-run', 'plan the requests but do not send them', false)
  .option('--include-unsafe', 'also probe mutating verbs (POST/PUT/PATCH/DELETE)', false)
  .option('--no-baseline', 'skip baseline self-access sanity checks')
  .option('--only <kind>', 'plan only one test family: bola, bfla, or baseline')
  .option('--concurrency <n>', 'max concurrent requests', (v) => parseInt(v, 10), 5)
  .option('--timeout <ms>', 'per-request timeout in milliseconds', (v) => parseInt(v, 10), 10_000)
  .option('--json <file>', 'also write a machine-readable JSON report to this file')
  .option('--no-fail-on-finding', 'exit 0 even when findings are detected (report only)')
  .action(async (opts) => {
    try {
      const only = parseOnlyFilter(opts.only);
      const report = await scan({
        specPath: opts.spec,
        configPath: opts.config,
        baseUrl: opts.baseUrl,
        dryRun: opts.dryRun,
        includeUnsafe: opts.includeUnsafe,
        includeBaseline: opts.baseline, // commander maps --no-baseline -> baseline:false
        only,
        concurrency: opts.concurrency,
        timeoutMs: opts.timeout,
      });

      if (report.cases.length === 0) {
        console.log(
          pc.yellow(
            'No test cases generated. Check that your spec has object-scoped operations\n' +
              'and that identities in the config declare `owns` for those path parameters.',
          ),
        );
      }

      printReport(report.evaluations, { dryRun: opts.dryRun });

      if (opts.json) {
        await writeFile(opts.json, toJson(report.evaluations), 'utf8');
        console.log(pc.gray(`\nJSON report written to ${opts.json}`));
      }

      const counts = summarize(report.evaluations);
      const shouldFail = opts.failOnFinding && counts.FAIL > 0 && !opts.dryRun;
      process.exit(shouldFail ? 1 : 0);
    } catch (err) {
      console.error(pc.red(`\nError: ${(err as Error).message}`));
      process.exit(2);
    }
  });

program.parseAsync(process.argv);
