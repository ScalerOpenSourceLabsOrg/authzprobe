# Architecture

AuthzProbe is a small, deterministic pipeline. Each stage has one job, a plain
input type, and a plain output type — so any stage can be understood, tested, or
replaced on its own. This document explains *what* each stage does and *why* it's
shaped the way it is.

## The pipeline

```
                 spec/parse.ts        engine/plan.ts       engine/replay.ts    engine/evaluate.ts   report/report.ts
OpenAPI spec ──►  SpecOperation[]  ─┐
                                    ├─►  TestCase[]  ──►   ReplayResult[]  ──►  Evaluation[]  ──►   table + JSON
identity config ─► Config  ────────┘
```

All types live in `src/types.ts` (domain) and `src/config/schema.ts` (config).
The orchestrator `engine/run.ts` wires the stages together and is the single
entry point used by both the CLI and the tests.

## Stage by stage

### 1. `spec/parse.ts` — OpenAPI → `SpecOperation[]`
Uses `@apidevtools/swagger-parser` to **dereference** the document (resolving all
`$ref`s) and then flattens it into a tiny `SpecOperation` shape: method, path,
path/query param names, whether security is declared, and whether the verb is
safe. **Why flatten?** The OpenAPI object model is huge; the rest of the engine
should never have to touch it. Everything downstream depends only on
`SpecOperation`, which is trivial to construct in a test.

### 2. `config/` — YAML → validated `Config`
- `schema.ts` — a `zod` schema. It is `.strict()` so a typo'd key (e.g.
  `identites:`) is a loud error, not a silently-ignored field.
- `util/env.ts` — resolves `${ENV_VAR}` references. **Why:** secrets never belong
  in a committed config; a *missing* variable is a hard error so we never send an
  empty token and then misreport an endpoint as "properly denied".
- `load.ts` — read → interpolate → validate → check unique identity names.

### 3. `engine/plan.ts` — the core logic
Turns operations + config into concrete `TestCase`s. This is where the security
model lives.

- **BOLA**: for an operation with path params, for every ordered pair
  `(victim, actor)`, fill the path params from the *victim's* declared ownership
  and have the *actor* request it. Expect denial.
- **BFLA**: for an operation matched by a `privileged` rule, every identity *not*
  in the `allow` list attempts it. Expect denial.
- **BASELINE**: each identity requests its *own* resource. Expect success.

**Key design rule — never fabricate identifiers.** A BOLA case is only generated
when *every* path parameter can be filled from the victim's `owns`. If ownership
isn't declared, no case is emitted. This keeps findings explainable ("alice
reached bob's `order-b1`") and false positives near zero.

**Why baselines?** If the actor's own request *doesn't* succeed, the credentials
or the ownership mapping are wrong — which would make the BOLA results
meaningless. Baselines surface that as a `WARN` instead of quietly inflating the
pass count.

### 4. `engine/replay.ts` — `TestCase` → `ReplayResult`
Builds the URL (path substitution + query string + encoding), attaches the
actor's auth header (`bearer` / `header` / `basic`), and sends the request with
native `fetch`, a timeout, and bounded concurrency. In `--dry-run` it records the
request line and sends nothing.

### 5. `engine/evaluate.ts` — `ReplayResult` → `Evaluation`
The judgment table:

| Expectation | Server did | Verdict |
|-------------|-----------|---------|
| deny (BOLA/BFLA) | returned 2xx | **FAIL** (finding) |
| deny | returned a `denyStatuses` code | PASS |
| deny | returned something else (e.g. 500) | INCONCLUSIVE |
| allow (baseline) | returned 2xx | PASS |
| allow | returned non-2xx | WARN |
| any | transport error / dry-run | INCONCLUSIVE |

### 6. `report/report.ts` — output
A sorted table (findings first) plus a summary line, and a JSON serializer for
CI. The CLI exits non-zero when there is at least one `FAIL` (unless
`--no-fail-on-finding`), so a pipeline step fails on a real authorization bug.

## Design principles

- **Explicit over inferred.** Ownership is declared, never guessed. Every finding
  traces back to a line in the config.
- **Safe by default.** No mutating requests unless `--include-unsafe`.
- **Stateless.** No database, no server, no persisted state — it drops into CI
  and into a Docker `ENTRYPOINT` unchanged.
- **Pure, testable stages.** `plan` and `evaluate` are pure functions over plain
  data, which is why the unit tests need no network and no mocks.

## Where to extend

See `docs/CONTRIBUTING.md`. The highest-leverage extension points are new test
*families* in `plan.ts` (e.g. query-param object references, mass assignment)
and new auth types in `replay.ts` / `schema.ts`.
