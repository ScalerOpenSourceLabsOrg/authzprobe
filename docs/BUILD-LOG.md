# Build Log

A running note of **what** we're building and **why** — so anyone joining can
catch up fast, and so decisions aren't re-litigated. Newest entries at the top.

---

## 2026-09-10 — Community health files + maintainer handover (session 2)

### What changed
Turned the repo into a GSoC-level, contributor-ready project ahead of handing it
to a new student core maintainer under the club:

- Root `CONTRIBUTING.md` (canonical), `CODE_OF_CONDUCT.md` (Contributor Covenant
  2.1), `SECURITY.md` (private disclosure — matters for a security tool),
  `GOVERNANCE.md`, `MAINTAINERS.md`, `CHANGELOG.md`.
- `docs/HANDOVER.md` (onboarding for the new maintainer), `docs/GSOC_IDEAS.md`
  (project-sized ideas with size/skills/mentor/outcomes), `docs/ROADMAP.md`,
  `docs/GOOD_FIRST_ISSUES.md` (moved out of the old docs/CONTRIBUTING.md, which is
  now a pointer to root).
- `.github/`: issue templates (bug/feature/config), PR template, `CODEOWNERS`,
  `ci.yml` (test+typecheck+build matrix on Node 18/20/22 + demo job),
  `dependabot.yml`. Plus `.editorconfig` and `.nvmrc`.
- README: badges + a Community & contributing section.

### Why
- **Club ownership model:** governance is built around a *permanent Org Owner*
  (the club's official-email GitHub account) so the project survives president
  turnover; each lead is added/removed as an Owner. Documented in GOVERNANCE +
  HANDOVER.
- **Security policy is not optional here** — a tool that finds authz bugs must
  have a private disclosure path and a "responsible use" note.
- Everything personalized uses clearly-marked `<PLACEHOLDER>`s so the incoming
  maintainer does one find-replace pass. Placeholder list is in the session
  summary / HANDOVER access checklist.

### Follow-ups
- Fill in placeholders (see checklist): `<ORG>`, `<CLUB_NAME>`, `<CLUB_EMAIL>`,
  `<NEW_MAINTAINER>` / `<NEW_MAINTAINER_NAME>`, `<PRESIDENT_HANDLE>` /
  `<PRESIDENT_NAME>`, `<HANDOVER_DATE>`, `<MENTOR>`.
- After creating the org, transfer the repo in and enable Discussions + private
  vulnerability reporting.

---

## 2026-09-09 — Initial scaffold (Build Days, session 1)

### What exists now
A complete, working v0.1 of AuthzProbe end to end:

- **CLI** (`authzprobe scan`) with flags for dry-run, unsafe verbs, baseline
  toggle, concurrency, timeout, JSON output, and CI exit codes.
- **Spec parser** → flat `SpecOperation[]`.
- **Config** (zod schema + YAML loader + `${ENV}` interpolation).
- **Engine**: `plan` (BOLA/BFLA/baseline generation) → `replay` (fetch with
  concurrency + timeout) → `evaluate` (verdicts) → `run` (orchestrator).
- **Reporter**: colored table + machine-readable JSON.
- **Runnable demo**: a vulnerable mock server + `npm run demo` that finds real
  BOLA and BFLA bugs offline.
- **23 unit tests** (all green), typecheck clean, `npm run build` clean, Dockerfile.

Verified: `npm test` → 23 passing. `npm run demo` → `4 FAIL · 0 WARN · 6 PASS`
(2 BOLA, 2 BFLA correctly found; secured endpoint correctly passes).

### Why these decisions

- **Explicit ownership config, never inference.** The whole reason existing spec
  linters can't do this is that authorization is a *runtime* property tied to
  *who owns what* — which isn't in the spec. We make ownership an explicit,
  human-authored input (`owns:`). Consequence: every finding is explainable and
  false positives are near zero. We would rather emit *no* test than a guessed one.

- **Baseline self-access checks.** Cross-access tests are only trustworthy if the
  actor can reach their *own* data. If a baseline fails, creds or the mapping are
  wrong. We surface that as `WARN` rather than letting it silently inflate PASS.

- **Safe by default.** Only GET/HEAD are probed unless `--include-unsafe`. A
  security tool that mutates data by accident is unacceptable, especially in CI.

- **Pure functions for the core.** `plan` and `evaluate` are pure over plain data,
  so they're tested with zero network and zero mocks. I/O is quarantined in
  `replay` and `load`.

- **Stateless + Docker + non-zero exit on findings.** The design target is "drop
  into CI". No DB, no server. `exit 1` on a finding so a pipeline step fails.

- **Native `fetch`, tiny dependency set.** Node 18+ has fetch built in; deps are
  just spec-parser, yaml, zod, commander, and two presentation libs. Less to audit.

- **`.strict()` config schema.** A typo'd config key errors loudly instead of
  being ignored — silent misconfig is how security tools give false comfort.

### Known limitations / deferred (turned into good-first-issues)
- Only path-param object references today; query-param object refs are issue #5.
- No stateful/sequence BOLA (create-then-read-as-other) yet — issue #10.
- Deny detection is status-code based; body-based deny is issue #7.
- No rate-limit/429 handling yet — issue #8.
- `authzprobe init` config scaffolder not built — issue #9.

### What to have contributors do tonight
Point them at `docs/CONTRIBUTING.md`. Starter issues #1–#4 are each ~1 file and
have acceptance criteria. Have everyone run `npm run demo` first so they see a
real finding before touching code.

---

## Template for future entries

```
## YYYY-MM-DD — <headline>
### What changed
### Why
### Follow-ups
```
