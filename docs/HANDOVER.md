# Maintainer Handover

Welcome, **<NEW_MAINTAINER_NAME>** 👋 — this repo is now yours to lead. This
document is the checklist and context to take over AuthzProbe as the new core
maintainer under **Scaler Open Source Labs**. Read it top to bottom once; it should take
about 20 minutes.

> Handed over by **Prateek Singh** ([@PRAteek-singHWY](https://github.com/PRAteek-singHWY)) on **<HANDOVER_DATE>**.

## 1. What AuthzProbe is (the 2-minute version)

A CLI that takes an OpenAPI spec + two or more sets of credentials and checks
whether one identity can reach another's data — catching **BOLA** and **BFLA**
(OWASP API Security Top 10). Spec linters only check that auth is *declared*;
AuthzProbe checks the server actually *enforces* it. Read [`README.md`](../README.md)
and [`ARCHITECTURE.md`](./ARCHITECTURE.md) for the full picture, and skim
[`BUILD-LOG.md`](./BUILD-LOG.md) for *why* things are the way they are.

## 2. Get it running (do this first)

```bash
nvm use                # or install Node >= 18
npm install
npm run demo           # should find 2 BOLA + 2 BFLA against the mock server
npm test               # 23 tests, all green
npm run typecheck
npm run build
```

If `npm run demo` prints `4 FAIL · 0 WARN · 6 PASS`, you have a healthy checkout.

## 3. Access checklist (what to get from the outgoing maintainer)

- [ ] Added as an **Owner** (or repo **Admin**) of the `ScalerOpenSourceLabsOrg` GitHub org.
- [ ] Added to the `maintainers` team.
- [ ] Listed in [`MAINTAINERS.md`](../MAINTAINERS.md) and
      [`.github/CODEOWNERS`](../.github/CODEOWNERS).
- [ ] Access to the club's official GitHub account recovery info is documented
      with the club (this account stays the **permanent Org Owner** — see
      [`GOVERNANCE.md`](../GOVERNANCE.md)).
- [ ] Access to the npm package (if/when published) and any CI secrets.
- [ ] Admin on [GitHub Discussions](https://github.com/ScalerOpenSourceLabsOrg/authzprobe/discussions).

## 4. Your recurring responsibilities

- **Triage** new issues weekly: label, confirm, and mark good ones as
  `good first issue` / `help wanted`.
- **Review PRs**: CI must be green + the [PR checklist](../CONTRIBUTING.md#opening-a-pull-request)
  satisfied. Merge with **squash & merge**.
- **Protect the principles** (these are the soul of the project — guard them in
  review):
  - Never fabricate identifiers or ownership — everything traces to the config.
  - Safe by default — mutations stay behind `--include-unsafe`.
  - Keep `plan` and `evaluate` pure and unit-tested.
- **Keep docs honest** — update [`CHANGELOG.md`](../CHANGELOG.md) and
  [`BUILD-LOG.md`](./BUILD-LOG.md) as things change.
- **Grow contributors** — see §6.

## 5. Repository map

```
src/            the tool (engine in src/engine/*, CLI in src/cli.ts)
examples/       demo spec, config, vulnerable mock server
tests/          vitest unit tests
docs/           ARCHITECTURE, BUILD-LOG, HANDOVER (this), GOOD_FIRST_ISSUES, GSOC_IDEAS, ROADMAP
.github/        issue/PR templates, CODEOWNERS, CI workflow
```

Community health files at root: `README`, `CONTRIBUTING`, `CODE_OF_CONDUCT`,
`SECURITY`, `GOVERNANCE`, `MAINTAINERS`, `CHANGELOG`, `LICENSE`.

## 6. Running it as a club / GSoC project

- **Onboard contributors**: point them at [`CONTRIBUTING.md`](../CONTRIBUTING.md)
  and [`GOOD_FIRST_ISSUES.md`](./GOOD_FIRST_ISSUES.md). Make sure ~10 starter
  issues are always open and labeled.
- **GSoC**: the [`GSOC_IDEAS.md`](./GSOC_IDEAS.md) file is your project-ideas
  list — keep it current with sizes, skills, and mentors. Note that applying as a
  GSoC *mentoring org* is a separate process with Google; this file feeds it.
- **Roadmap**: keep [`ROADMAP.md`](./ROADMAP.md) reflecting the next 2–3
  milestones so contributors know where things are headed.

## 7. When it's your turn to hand over

Do for your successor exactly what was done for you: nominate them, grant roles,
update `MAINTAINERS.md` + `CODEOWNERS`, move yourself to Emeritus, and confirm
the club's official account remains a permanent Org Owner. Then update the
"Handed over by / on" line at the top of this file.

---

Questions during the transition? Reach the outgoing maintainer at
[@PRAteek-singHWY](https://github.com/PRAteek-singHWY) or the club at
**<CLUB_EMAIL>**. Good luck — you've got this. 🚀
