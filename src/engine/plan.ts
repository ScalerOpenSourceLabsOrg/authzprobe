import type { Config, Identity, PrivilegedRule } from '../config/schema.js';
import type { SpecOperation, TestCase, TestKind } from '../types.js';

export interface PlanOptions {
  /** Include mutating verbs (POST/PUT/PATCH/DELETE). Off by default for safety. */
  includeUnsafe: boolean;
  /** Emit baseline self-access checks that confirm auth actually works. */
  includeBaseline: boolean;
  /** Restrict the plan to a single test family: BOLA, BFLA, or BASELINE. */
  only?: TestKind;
}

/** `--only` accepts these lowercase values, each mapping to one test family. */
const ONLY_FILTERS: Record<string, TestKind> = {
  bola: 'BOLA',
  bfla: 'BFLA',
  baseline: 'BASELINE',
};

/**
 * Parse the CLI `--only <kind>` value. Throws a clear error listing the
 * allowed values when the input is not one of them.
 */
export function parseOnlyFilter(value: string | undefined): TestKind | undefined {
  if (value === undefined) return undefined;
  const kind = ONLY_FILTERS[value.toLowerCase()];
  if (!kind) {
    throw new Error(
      `Invalid value for --only: "${value}". Allowed values: bola, bfla, baseline.`,
    );
  }
  return kind;
}

const DEFAULT_PLAN_OPTIONS: PlanOptions = {
  includeUnsafe: false,
  includeBaseline: true,
};

/**
 * Turn a parsed spec + identity config into concrete, replayable test cases.
 *
 * Three families are produced:
 *   BOLA     — actor requests a resource that `victim` owns; expect denial.
 *   BFLA     — actor invokes a privileged operation they are not allowed to; expect denial.
 *   BASELINE — actor requests their OWN resource; expect success (catches bad creds/mapping).
 *
 * Nothing is invented: a BOLA case is only generated when every path parameter
 * of the operation can be filled from the victim's declared ownership.
 */
export function planTests(
  operations: SpecOperation[],
  config: Config,
  options: Partial<PlanOptions> = {},
): TestCase[] {
  const opts = { ...DEFAULT_PLAN_OPTIONS, ...options };
  const cases: TestCase[] = [];

  for (const op of operations) {
    if (!op.isSafe && !opts.includeUnsafe) continue;

    cases.push(...planBola(op, config, opts));
    cases.push(...planBfla(op, config));
  }

  return opts.only ? cases.filter((c) => c.kind === opts.only) : cases;
}

function planBola(op: SpecOperation, config: Config, opts: PlanOptions): TestCase[] {
  // Only object-scoped operations (those with path params) can exhibit BOLA.
  if (op.pathParams.length === 0) return [];

  const cases: TestCase[] = [];

  for (const victim of config.identities) {
    const victimValues = resolvePathValues(op, victim);
    if (!victimValues) continue; // victim doesn't own all params -> can't target them

    // BASELINE: victim accessing their own resource should succeed.
    if (opts.includeBaseline) {
      cases.push({
        id: `baseline:${signature(op)}:${victim.name}`,
        kind: 'BASELINE',
        operation: op,
        actor: victim.name,
        pathValues: victimValues,
        queryValues: {},
        description: `${victim.name} accesses own ${describeTarget(op, victimValues)}`,
        expectation: 'allow',
      });
    }

    // BOLA: every OTHER identity trying to reach victim's resource must be denied.
    for (const actor of config.identities) {
      if (actor.name === victim.name) continue;
      cases.push({
        id: `bola:${signature(op)}:${actor.name}->${victim.name}`,
        kind: 'BOLA',
        operation: op,
        actor: actor.name,
        victim: victim.name,
        pathValues: victimValues,
        queryValues: {},
        description: `${actor.name} tries to reach ${victim.name}'s ${describeTarget(op, victimValues)}`,
        expectation: 'deny',
      });
    }
  }

  return cases;
}

function planBfla(op: SpecOperation, config: Config): TestCase[] {
  const rule = matchRule(op, config.privileged);
  if (!rule) return [];

  const cases: TestCase[] = [];

  for (const actor of config.identities) {
    if (rule.allow.includes(actor.name)) continue; // allowed -> not a violation

    // Fill path params from the actor's own ownership when possible; otherwise
    // borrow any known value so the request is well-formed. If nothing fills a
    // param, skip — we won't fabricate identifiers.
    const values = resolvePathValues(op, actor) ?? borrowPathValues(op, config.identities);
    if (op.pathParams.length > 0 && !values) continue;

    cases.push({
      id: `bfla:${signature(op)}:${actor.name}`,
      kind: 'BFLA',
      operation: op,
      actor: actor.name,
      pathValues: values ?? {},
      queryValues: {},
      description: `${actor.name} (not authorized) invokes privileged ${signature(op)}`,
      expectation: 'deny',
    });
  }

  return cases;
}

/** Resolve every path param of `op` from a single identity's ownership, or null. */
function resolvePathValues(
  op: SpecOperation,
  identity: Identity,
): Record<string, string> | null {
  const values: Record<string, string> = {};
  for (const param of op.pathParams) {
    const owned = identity.owns[param];
    if (!owned || owned.length === 0) return null;
    values[param] = String(owned[0]);
  }
  return values;
}

/** Fill path params from ANY identity that owns each one (used for BFLA only). */
function borrowPathValues(
  op: SpecOperation,
  identities: Identity[],
): Record<string, string> | null {
  const values: Record<string, string> = {};
  for (const param of op.pathParams) {
    const owner = identities.find((i) => i.owns[param]?.length);
    if (!owner) return null;
    values[param] = String(owner.owns[param]![0]);
  }
  return values;
}

/** Does a privileged rule target this operation (by operationId or "METHOD /path")? */
function matchRule(op: SpecOperation, rules: PrivilegedRule[]): PrivilegedRule | undefined {
  return rules.find(
    (r) => r.operation === op.operationId || r.operation === signature(op),
  );
}

/** Canonical "GET /users/{userId}" form used for matching and display. */
export function signature(op: SpecOperation): string {
  return `${op.method.toUpperCase()} ${op.path}`;
}

function describeTarget(op: SpecOperation, values: Record<string, string>): string {
  const filled = op.path.replace(/\{([^}]+)\}/g, (_m, name: string) => values[name] ?? `{${name}}`);
  return filled;
}
