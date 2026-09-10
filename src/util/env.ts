/**
 * Interpolate `${VAR}` references against process.env (or a supplied map).
 *
 * Secrets (tokens, passwords) never belong in a committed config file, so the
 * config references environment variables and we resolve them at load time.
 * A missing variable is a hard error — failing loud beats silently sending an
 * empty token and misreporting an endpoint as "properly denied".
 */
const REF = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}/g;

export function interpolateEnv(
  value: string,
  env: Record<string, string | undefined> = process.env,
): string {
  return value.replace(REF, (_match, name: string) => {
    const resolved = env[name];
    if (resolved === undefined) {
      throw new Error(
        `Environment variable "${name}" referenced in config is not set.`,
      );
    }
    return resolved;
  });
}

/** Recursively interpolate every string in a parsed-YAML value. */
export function interpolateDeep<T>(
  value: T,
  env: Record<string, string | undefined> = process.env,
): T {
  if (typeof value === 'string') {
    return interpolateEnv(value, env) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map((v) => interpolateDeep(v, env)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = interpolateDeep(v, env);
    }
    return out as T;
  }
  return value;
}
