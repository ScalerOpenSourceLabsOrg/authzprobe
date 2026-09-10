# AuthzProbe

[![CI](https://github.com/<ORG>/authzprobe/actions/workflows/ci.yml/badge.svg)](https://github.com/<ORG>/authzprobe/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Node >= 18](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](./.nvmrc)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/Contributor%20Covenant-2.1-purple.svg)](./CODE_OF_CONDUCT.md)

**Spec-driven API authorization tester.** Give it an OpenAPI spec and two or
more sets of credentials, and it checks whether one identity can reach another
identity's data — catching **BOLA** (Broken Object Level Authorization) and
**BFLA** (Broken Function Level Authorization), the top two items in the
[OWASP API Security Top 10](https://owasp.org/API-Security/).

> Spec linters like Spectral and vacuum only check whether a spec *declares*
> auth. They can't tell you whether the running server actually *enforces* it.
> Every tool that tests this properly today is commercial. AuthzProbe is a free,
> open, CI-friendly CLI that does exactly that — and nothing else.

---

## The 60-second demo

No real backend needed — a deliberately-vulnerable mock server ships in `examples/`.

```bash
npm install
npm run demo
```

You'll see AuthzProbe find a BOLA bug (one user reading another's order), a BFLA
bug (a non-admin reading `/admin/stats`), correctly *pass* a properly-secured
endpoint, and confirm each identity can reach its own data (baseline).

```
Summary: 4 FAIL  ·  0 WARN  ·  6 PASS  ·  0 inconclusive
✖ 4 authorization findings detected.
```

## How it works

```
OpenAPI spec ─┐
              ├─► plan cross-identity test cases ─► replay each request ─► evaluate ─► report
identity map ─┘   (BOLA / BFLA / baseline)          (with each identity's creds)   (2xx that
                                                                                    should be 4xx)
```

1. **Parse** the OpenAPI spec into a flat list of operations.
2. **Load** an identity/resource mapping config — the human-authored source of
   truth for *who legitimately owns what*. AuthzProbe never guesses ownership.
3. **Plan** test cases:
   - **BOLA** — identity A requests a resource that identity B owns → expect denial.
   - **BFLA** — an identity invokes a privileged operation it isn't allowed to → expect denial.
   - **BASELINE** — an identity requests its *own* resource → expect success (catches bad creds/mapping).
4. **Replay** each request with the actor's real credentials.
5. **Evaluate**: any request that should have been denied but returned `2xx` is a **FAIL** (a finding).
6. **Report** as a table and optional JSON, exiting non-zero on findings so it gates CI.

Read-only verbs (GET/HEAD) are probed by default. Mutating verbs
(POST/PUT/PATCH/DELETE) are isolated behind `--include-unsafe` so a scan can't
change data unless you opt in.

## Usage

```bash
authzprobe scan \
  --spec ./openapi.yaml \
  --config ./identities.yaml \
  --json report.json
```

Key flags:

| Flag | Meaning |
|------|---------|
| `--spec <path>` | OpenAPI spec (file path or URL) |
| `--config <path>` | Identity/resource mapping config (YAML) |
| `--base-url <url>` | Override the `baseUrl` in the config |
| `--dry-run` | Plan the requests but send nothing |
| `--include-unsafe` | Also probe mutating verbs (off by default) |
| `--no-baseline` | Skip baseline self-access checks |
| `--json <file>` | Write a machine-readable report |
| `--no-fail-on-finding` | Report only; always exit 0 |
| `--concurrency <n>` | Max concurrent requests (default 5) |

## The config file

```yaml
baseUrl: https://api.example.com
identities:
  - name: alice
    auth: { type: bearer, token: ${ALICE_TOKEN} }   # secrets via env vars
    owns:
      userId: ["alice-123"]      # parameter name -> values this identity owns
      orderId: ["order-a1"]
  - name: bob
    auth: { type: bearer, token: ${BOB_TOKEN} }
    owns:
      userId: ["bob-456"]
      orderId: ["order-b1"]
privileged:                       # BFLA rules (optional)
  - operation: "GET /admin/stats"
    allow: ["admin"]
denyStatuses: [401, 403, 404]     # what counts as a correct denial
```

Auth types: `bearer` (token), `header` (custom name/value, e.g. `X-Api-Key`), `basic` (username/password).

## Docker

```bash
docker build -t authzprobe .
docker run --rm -v "$PWD:/work" -e ALICE_TOKEN -e BOB_TOKEN authzprobe \
  scan --spec /work/openapi.yaml --config /work/identities.yaml
```

## Development

```bash
npm install
npm run dev -- scan --spec examples/petstore-openapi.yaml --config examples/identities.yaml --dry-run
npm test          # vitest
npm run typecheck
npm run build
```

## Project layout

```
src/
  cli.ts              CLI entry (commander)
  spec/parse.ts       OpenAPI -> SpecOperation[]
  config/             config schema (zod) + loader + env interpolation
  engine/
    plan.ts           SpecOperation[] + config -> TestCase[]   (the core logic)
    replay.ts         TestCase -> HTTP request -> ReplayResult
    evaluate.ts       ReplayResult -> Evaluation (PASS/FAIL/WARN/INCONCLUSIVE)
    run.ts            end-to-end orchestrator
  report/report.ts    table + JSON output
examples/             demo spec, config, and vulnerable mock server
docs/                 ARCHITECTURE, BUILD-LOG, CONTRIBUTING
tests/                vitest unit tests
```

See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) for the design.

## Community & contributing

We welcome contributors of all experience levels — this is a
**<CLUB_NAME>** community project.

- 🤝 [Contributing guide](./CONTRIBUTING.md) — setup, workflow, PR process
- 🟢 [Good first issues](./docs/GOOD_FIRST_ISSUES.md) — start here
- 🎓 [GSoC / project ideas](./docs/GSOC_IDEAS.md) — larger, mentored work
- 🗺️ [Roadmap](./docs/ROADMAP.md) · 📓 [Build log](./docs/BUILD-LOG.md)
- 📜 [Code of Conduct](./CODE_OF_CONDUCT.md) · 🏛️ [Governance](./GOVERNANCE.md) · 👥 [Maintainers](./MAINTAINERS.md)
- 🔒 Found a vulnerability? See [`SECURITY.md`](./SECURITY.md) — please report privately.

## License

[MIT](./LICENSE) © <CLUB_NAME> contributors.
