import type { Config } from '../config/schema.js';
import type { Evaluation, TestCase } from '../types.js';
import { loadConfig } from '../config/load.js';
import { parseSpec } from '../spec/parse.js';
import { planTests, type PlanOptions } from './plan.js';
import { replayAll, type ReplayOptions } from './replay.js';
import { evaluateAll } from './evaluate.js';

export interface ScanOptions
  extends Partial<PlanOptions>,
    Partial<ReplayOptions> {
  specPath: string;
  configPath: string;
  /** Override the baseUrl declared in the config. */
  baseUrl?: string;
  concurrency?: number;
}

export interface ScanReport {
  config: Config;
  cases: TestCase[];
  evaluations: Evaluation[];
}

/**
 * End-to-end scan: parse spec -> load config -> plan -> replay -> evaluate.
 * This is the single entry point used by both the CLI and the test suite.
 */
export async function scan(options: ScanOptions): Promise<ScanReport> {
  const [operations, loaded] = await Promise.all([
    parseSpec(options.specPath),
    loadConfig(options.configPath),
  ]);

  const config: Config = options.baseUrl
    ? { ...loaded, baseUrl: options.baseUrl }
    : loaded;

  const cases = planTests(operations, config, {
    includeUnsafe: options.includeUnsafe,
    includeBaseline: options.includeBaseline,
    only: options.only,
  });

  const results = await replayAll(cases, config, {
    dryRun: options.dryRun,
    timeoutMs: options.timeoutMs,
    concurrency: options.concurrency,
  });

  const evaluations = evaluateAll(results, config);
  return { config, cases, evaluations };
}
