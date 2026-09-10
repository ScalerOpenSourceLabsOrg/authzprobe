# Roadmap

Where AuthzProbe is headed. This is a living document — maintainers update it as
priorities shift. Dates are targets, not promises.

## ✅ v0.1 — Foundation (done)

- OpenAPI parsing → flat operation model
- Identity/resource mapping config (YAML + env interpolation, zod-validated)
- BOLA / BFLA / baseline test planning
- Concurrent replay engine with timeouts
- Verdict evaluation + table/JSON reporting
- Runnable vulnerable mock server + one-command demo
- Unit tests, CI, Docker image

## 🎯 v0.2 — Trustworthy results (next)

- Query-param & header object references ([GFI #6](./GOOD_FIRST_ISSUES.md))
- Body-based allow/deny detection ([GFI #7](./GOOD_FIRST_ISSUES.md))
- Rate-limit / 429 handling ([GFI #8](./GOOD_FIRST_ISSUES.md))
- `--only <kind>` filter and richer `--dry-run` output
- Coverage report: probed vs. skipped operations, with reasons

## 🎯 v0.3 — Meets real APIs

- OAuth2 / login-endpoint / cookie auth providers ([Idea #2](./GSOC_IDEAS.md))
- `authzprobe init` config scaffolder ([Idea #5](./GSOC_IDEAS.md))
- securityScheme awareness & config validation

## 🎯 v0.4 — CI-native

- SARIF + JUnit reporters, HTML report ([Idea #3](./GSOC_IDEAS.md))
- Baseline/diff mode (fail only on *new* findings)
- Published `<ORG>/authzprobe-action`

## 🔭 Beyond — Autonomy

- Stateful, credential-driven discovery ([Idea #1](./GSOC_IDEAS.md))
- Plugin API for custom test families
- 1.0: stable config schema and CLI surface

## How to influence the roadmap

Open a [Discussion](https://github.com/<ORG>/authzprobe/discussions) or comment
on a tracking issue. Significant changes follow the process in
[`GOVERNANCE.md`](../GOVERNANCE.md).
