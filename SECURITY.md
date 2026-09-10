# Security Policy

AuthzProbe is a security testing tool, so we hold ourselves to a high bar. Thank
you for helping keep it — and its users — safe.

## Supported versions

The project is pre-1.0. Security fixes are applied to the latest released
version and the `main` branch.

| Version | Supported |
|---------|-----------|
| 0.1.x   | ✅        |
| < 0.1   | ❌        |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub issues,
discussions, or pull requests.**

Instead, use one of these private channels:

1. **GitHub Private Vulnerability Reporting** (preferred) — go to the
   [Security tab](https://github.com/ScalerOpenSourceLabsOrg/authzprobe/security/advisories/new)
   and open a draft advisory.
2. **Email** — send details to **<CLUB_EMAIL>** with the subject
   `[SECURITY] AuthzProbe`.

Please include, as far as you can:

- A description of the issue and its impact.
- Steps to reproduce (a minimal spec/config or command is ideal).
- The version or commit affected.
- Any suggested remediation.

## What to expect

- **Acknowledgement** within **3 business days**.
- An initial assessment and severity rating within **7 business days**.
- We will keep you informed of progress and coordinate a disclosure timeline
  with you. We aim to ship a fix within **90 days** of triage.
- With your permission, we will credit you in the advisory and changelog.

## Scope

In scope:

- Vulnerabilities in AuthzProbe's own code (the CLI, engine, parsers, or report
  output) — for example, code execution via a crafted spec/config, secret
  leakage in logs or reports, or SSRF beyond the intended target.
- Flaws that cause AuthzProbe to **miss real findings** or emit **false
  assurances** (a security tool that lies is itself a vulnerability).

Out of scope:

- Vulnerabilities in a *target API you scan* — that's the tool working as
  intended; report those to the API's owner.
- Issues in third-party dependencies without a demonstrated impact on AuthzProbe
  (please still tell us so we can bump them).

## Responsible use

AuthzProbe sends real requests using real credentials. **Only scan systems you
own or are explicitly authorized to test.** Unauthorized testing may be illegal.
Mutating requests are gated behind `--include-unsafe` for exactly this reason.
