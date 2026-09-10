import { z } from 'zod';

/**
 * How to authenticate a single identity when replaying requests.
 * Kept intentionally small — cover the common cases, add more via a good-first-issue.
 */
export const AuthSchema = z
  .object({
    type: z.enum(['bearer', 'header', 'basic']).default('bearer'),
    /** For type: bearer — the token (usually an `${ENV_VAR}` reference). */
    token: z.string().optional(),
    /** For type: header — a custom header name, e.g. `X-Api-Key`. */
    header: z.string().optional(),
    /** For type: header — the header value. */
    value: z.string().optional(),
    /** For type: basic. */
    username: z.string().optional(),
    password: z.string().optional(),
  })
  .strict();

/**
 * A single identity: who they are, how to auth as them, and which resources
 * they LEGITIMATELY own. Ownership is keyed by the parameter name used in the
 * spec (e.g. `userId`) mapped to the concrete values they own.
 */
export const IdentitySchema = z
  .object({
    name: z.string().min(1),
    auth: AuthSchema,
    owns: z
      .record(z.string(), z.array(z.union([z.string(), z.number()])))
      .default({}),
  })
  .strict();

/**
 * A BFLA rule: an operation that only the listed identities are allowed to
 * invoke. Every other identity attempting it should be denied.
 * `operation` matches either an `operationId` or a `"METHOD /templated/path"`.
 */
export const PrivilegedRuleSchema = z
  .object({
    operation: z.string().min(1),
    allow: z.array(z.string()).default([]),
  })
  .strict();

export const ConfigSchema = z
  .object({
    /** Base URL of the running server under test. */
    baseUrl: z.string().url(),
    /** At least two identities are required to probe cross-access. */
    identities: z.array(IdentitySchema).min(2),
    /** Optional BFLA rules. */
    privileged: z.array(PrivilegedRuleSchema).default([]),
    /** HTTP statuses that count as a correct denial. */
    denyStatuses: z.array(z.number().int()).default([401, 403, 404]),
  })
  .strict();

export type Auth = z.infer<typeof AuthSchema>;
export type Identity = z.infer<typeof IdentitySchema>;
export type PrivilegedRule = z.infer<typeof PrivilegedRuleSchema>;
export type Config = z.infer<typeof ConfigSchema>;
