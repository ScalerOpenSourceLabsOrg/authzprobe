import { readFile } from 'node:fs/promises';
import { parse as parseYaml } from 'yaml';
import { ConfigSchema, type Config } from './schema.js';
import { interpolateDeep } from '../util/env.js';

/**
 * Load, env-interpolate, and validate an identity/resource mapping config.
 *
 * The config is the human-authored source of truth for "who legitimately owns
 * what". AuthzProbe never guesses ownership — it only tests the relationships
 * declared here, which keeps findings explainable and false positives low.
 */
export async function loadConfig(configPath: string): Promise<Config> {
  let raw: string;
  try {
    raw = await readFile(configPath, 'utf8');
  } catch (err) {
    throw new Error(`Could not read config "${configPath}": ${(err as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = parseYaml(raw);
  } catch (err) {
    throw new Error(`Config "${configPath}" is not valid YAML: ${(err as Error).message}`);
  }

  // Resolve ${ENV} references before validation so schema sees real values.
  const interpolated = interpolateDeep(parsed);

  const result = ConfigSchema.safeParse(interpolated);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Config "${configPath}" is invalid:\n${issues}`);
  }

  assertUniqueIdentityNames(result.data);
  return result.data;
}

function assertUniqueIdentityNames(config: Config): void {
  const seen = new Set<string>();
  for (const identity of config.identities) {
    if (seen.has(identity.name)) {
      throw new Error(`Duplicate identity name "${identity.name}" in config.`);
    }
    seen.add(identity.name);
  }
}
