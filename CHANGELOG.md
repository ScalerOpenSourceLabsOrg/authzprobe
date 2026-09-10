# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

_Nothing yet — add entries here as you merge PRs._

## [0.1.0] — 2026-09-09

### Added

- Initial release of AuthzProbe.
- `authzprobe scan` command with `--spec`, `--config`, `--base-url`, `--dry-run`,
  `--include-unsafe`, `--no-baseline`, `--concurrency`, `--timeout`, `--json`,
  and `--no-fail-on-finding` flags.
- OpenAPI parsing into a flat operation model (`src/spec/parse.ts`).
- Identity/resource mapping config: YAML + `${ENV}` interpolation, validated by a
  strict zod schema.
- Test planning for **BOLA**, **BFLA**, and **baseline** self-access checks.
- Concurrent replay engine with per-request timeouts and `bearer` / `header` /
  `basic` auth.
- Verdict evaluation (PASS / FAIL / WARN / INCONCLUSIVE) and table + JSON reports.
- Bundled deliberately-vulnerable mock server and a one-command `npm run demo`.
- 23 unit tests, TypeScript strict mode, and a multi-stage Dockerfile.

[Unreleased]: https://github.com/ScalerOpenSourceLabsOrg/authzprobe/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/ScalerOpenSourceLabsOrg/authzprobe/releases/tag/v0.1.0
