/**
 * Public library surface. AuthzProbe is primarily a CLI, but the engine is
 * exported so it can be embedded in other tools or driven from tests.
 */
export { scan, type ScanOptions, type ScanReport } from './engine/run.js';
export { parseSpec } from './spec/parse.js';
export { loadConfig } from './config/load.js';
export { planTests, signature, type PlanOptions } from './engine/plan.js';
export { replay, replayAll, buildUrl, authHeaders } from './engine/replay.js';
export { evaluate, evaluateAll, summarize } from './engine/evaluate.js';
export { printReport, toJson } from './report/report.js';
export * from './types.js';
export {
  ConfigSchema,
  type Config,
  type Identity,
  type Auth,
  type PrivilegedRule,
} from './config/schema.js';
