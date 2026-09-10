# Contributing to AuthzProbe

Thanks for your interest in contributing! AuthzProbe is a community project
maintained by **<CLUB_NAME>**. This guide gets you from zero to a merged pull
request. It is intentionally short — read it once, then dive in.

By participating you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md).

## Table of contents

- [Ways to contribute](#ways-to-contribute)
- [Development setup](#development-setup)
- [Project layout](#project-layout)
- [Claiming an issue](#claiming-an-issue)
- [Branch & commit conventions](#branch--commit-conventions)
- [Opening a pull request](#opening-a-pull-request)
- [Review process](#review-process)
- [Where to ask questions](#where-to-ask-questions)

## Ways to contribute

- **Code** — pick a [good first issue](./docs/GOOD_FIRST_ISSUES.md) or a larger
  [GSoC-style idea](./docs/GSOC_IDEAS.md).
- **Docs** — clarify anything that confused you while onboarding. Doc PRs are
  first-class contributions.
- **Bugs** — file a clear, reproducible [bug report](https://github.com/<ORG>/authzprobe/issues/new/choose).
- **Ideas** — start a thread in
  [GitHub Discussions](https://github.com/<ORG>/authzprobe/discussions).

## Development setup

**Prerequisites:** Node.js **>= 18** (we develop on the version in
[`.nvmrc`](./.nvmrc)) and npm. If you use `nvm`: `nvm use`.

```bash
git clone https://github.com/<ORG>/authzprobe.git
cd authzprobe
npm install

npm run demo        # boots the bundled vulnerable mock server + runs a scan
npm test            # 23 unit tests, no network required
npm run typecheck   # strict TypeScript, must be clean
npm run build       # compiles to dist/
```

Run the CLI without building, against the demo fixtures:

```bash
npm run dev -- scan \
  --spec examples/petstore-openapi.yaml \
  --config examples/identities.yaml \
  --dry-run
```

**Do the demo once before touching code** — seeing a real BOLA/BFLA finding is
the fastest way to understand what the tool does.

## Project layout

One stage per file, plain data between them. Full walkthrough in
[`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md). The two files where the
interesting logic lives:

- `src/engine/plan.ts` — how test cases are generated (BOLA / BFLA / baseline).
- `src/engine/evaluate.ts` — how a response becomes a verdict.

## Claiming an issue

1. Comment `/assign` (or "I'd like to take this") on the issue.
2. A maintainer assigns it to you. Please don't open a PR for an issue assigned
   to someone else.
3. If you go quiet for ~7 days, we may unassign so others aren't blocked.

Always work from an issue. If one doesn't exist for your change, open it first so
the approach can be agreed before you write code.

## Branch & commit conventions

- Branch from `main`: `feat/only-flag`, `fix/query-param-encoding`, `docs/readme-typo`.
- We use [Conventional Commits](https://www.conventionalcommits.org/):
  ```
  feat(plan): add --only filter for bola/bfla/baseline
  fix(replay): url-encode path values with spaces
  docs(contributing): clarify assignment flow
  test(evaluate): cover 429 responses
  ```
- Keep commits focused and the history readable. Squash noise before review.

## Opening a pull request

Before you push, this must all pass locally:

```bash
npm test && npm run typecheck && npm run build
```

Then open a PR against `main` and fill in the template. A good PR:

- [ ] Links the issue it closes (`Closes #123`).
- [ ] Adds/updates tests for any behavior change (tests must not hit the network
      except the bundled mock server).
- [ ] Keeps the diff focused — one concern per PR.
- [ ] Updates docs if behavior or flags changed.
- [ ] Preserves the project's rules: **never fabricate identifiers/ownership**,
      and **anything that mutates server state stays behind `--include-unsafe`**.

## Review process

- CI (test + typecheck + build) must be green.
- At least one maintainer approval is required to merge (see
  [`MAINTAINERS.md`](./MAINTAINERS.md)).
- Maintainers aim to give a first response within a few days. A nudge after a
  week is welcome.
- We merge with **squash & merge** to keep `main` linear.

## Where to ask questions

- **How do I…?** → [GitHub Discussions](https://github.com/<ORG>/authzprobe/discussions)
- **I found a bug** → [open an issue](https://github.com/<ORG>/authzprobe/issues/new/choose)
- **I found a security vulnerability** → **do not open a public issue**; follow
  [`SECURITY.md`](./SECURITY.md).

Welcome aboard 🎉
