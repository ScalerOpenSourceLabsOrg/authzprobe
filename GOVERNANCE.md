# Governance

AuthzProbe is a community open-source project stewarded by **<CLUB_NAME>**. This
document describes how decisions are made and how the project is owned — so it
keeps running smoothly as students join, lead, and graduate.

## Roles

| Role | Who | Can |
|------|-----|-----|
| **Org Owner** | The club's official GitHub account (`<CLUB_EMAIL>`) + current maintainers | Manage the org, add/remove maintainers, transfer repos |
| **Maintainer** | Trusted long-term contributors (see [`MAINTAINERS.md`](./MAINTAINERS.md)) | Review & merge PRs, cut releases, triage, manage issues |
| **Contributor** | Anyone who opens a PR or issue | Propose changes, review, discuss |

### The permanent owner (why this matters for a club)

The GitHub **organization** is owned by roles, not by one person. The club's
official-email GitHub account is a **permanent Org Owner** and never changes.
Each president/lead is *added* as an Owner while active and *removed* when they
step down. This is what makes AuthzProbe survive leadership turnover: the repo,
its issues, stars, and URL never move.

## Becoming a maintainer

Maintainers are contributors who have shown sustained, high-quality involvement.
The path:

1. Land several merged PRs and help review others' work.
2. Show good judgment in discussions and respect for the project's principles
   (see [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md)).
3. An existing maintainer nominates you; current maintainers reach lazy consensus
   (no objection within 5 days = approved).
4. You're added to `MAINTAINERS.md`, `.github/CODEOWNERS`, and the `maintainers`
   team.

Maintainers who are inactive for ~6 months may be moved to emeritus status (kept
in the credits, permissions relaxed) to keep the active set accurate.

## Decision making

- **Everyday changes** (bug fixes, docs, scoped features): one maintainer
  approval + green CI is enough to merge.
- **Significant changes** (new commands, breaking flags, architecture shifts):
  open an issue or Discussion first. Decisions are by **lazy consensus** among
  maintainers — a proposal passes if no maintainer objects within 5 days.
- **Disputes**: if maintainers can't reach consensus, the lead maintainer (see
  `MAINTAINERS.md`) makes the call, in consultation with the club's Org Owners.

## Releases

- Versioning follows [SemVer](https://semver.org/). Pre-1.0, minor bumps may
  include breaking changes (documented in [`CHANGELOG.md`](./CHANGELOG.md)).
- Any maintainer may propose a release; another maintainer confirms CI is green
  and tags it.

## Handing over

When a maintainer or president steps down, follow
[`docs/HANDOVER.md`](./docs/HANDOVER.md): nominate a successor, grant them the
right roles, update `MAINTAINERS.md` and `CODEOWNERS`, and confirm the club's
official account remains a permanent Org Owner.

## Amendments

Changes to this document follow the "significant changes" process above.
