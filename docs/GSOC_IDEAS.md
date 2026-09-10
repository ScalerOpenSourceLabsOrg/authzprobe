# Project Ideas (GSoC / Semester Projects)

Larger, mentor-backed projects suitable for Google Summer of Code, semester
capstones, or anyone who wants to own a meaningful chunk of AuthzProbe. For
small first tasks, see [`GOOD_FIRST_ISSUES.md`](./GOOD_FIRST_ISSUES.md).

**How to apply / propose:** open a
[Discussion](https://github.com/ScalerOpenSourceLabsOrg/authzprobe/discussions) describing your
approach and timeline, and tag a mentor. Read
[`ARCHITECTURE.md`](./ARCHITECTURE.md) first. For GSoC, follow the program's
official proposal process — this list is our ideas page.

**Sizes** follow GSoC conventions: 🟢 ~90 hrs · 🟡 ~175 hrs · 🔴 ~350 hrs.

---

### 1. Stateful, credential-driven discovery (no manual ownership mapping)
- **Size:** 🔴 ~350 hrs · **Difficulty:** Hard
- **Skills:** TypeScript, HTTP, OpenAPI, security testing
- **Mentor:** _<MENTOR>_
- **Problem:** Today ownership is declared in `identities.yaml`. That's precise
  but manual. Many APIs let you *create* a resource and get its id back.
- **Deliverables:**
  - A `--discover` mode that, per identity, calls create/list endpoints
    (`--include-unsafe`) to learn which object ids each identity legitimately
    owns, then runs BOLA cross-access using those.
  - Safeguards: dry-run planning, teardown of created resources, opt-in only.
  - Tests against the mock server extended with create/list endpoints.
- **Outcome:** AuthzProbe works on real APIs with near-zero manual config.

### 2. Framework-native adapters & auth flows
- **Size:** 🟡 ~175 hrs · **Difficulty:** Medium
- **Skills:** TypeScript, OAuth2/OIDC, HTTP auth
- **Mentor:** _<MENTOR>_
- **Problem:** Real credentials rarely come as static bearer tokens.
- **Deliverables:**
  - An auth-provider abstraction: OAuth2 client-credentials & password grants,
    login-endpoint token capture, cookie/session auth, refresh handling.
  - Reads the spec's `securitySchemes` and validates the config against them.
  - Docs + examples for 2–3 common setups.
- **Outcome:** Point AuthzProbe at APIs behind standard auth without hand-minting tokens.

### 3. Reporting, CI integration & a GitHub Action
- **Size:** 🟡 ~175 hrs · **Difficulty:** Medium
- **Skills:** TypeScript, CI/CD, GitHub Actions, a little frontend
- **Mentor:** _<MENTOR>_
- **Deliverables:**
  - Pluggable reporters: JUnit XML, SARIF (so findings show in GitHub code
    scanning), and a self-contained HTML report with remediation guidance.
  - A published `ScalerOpenSourceLabsOrg/authzprobe-action` so any repo can add a scan step.
  - Baseline/diff mode: fail CI only on *new* findings vs. a saved baseline.
- **Outcome:** AuthzProbe becomes a first-class CI security gate.

### 4. Coverage & correctness engine hardening
- **Size:** 🟢 ~90 hrs · **Difficulty:** Beginner–Medium
- **Skills:** TypeScript, testing, OpenAPI edge cases
- **Mentor:** _<MENTOR>_
- **Deliverables:**
  - Query-param and header object references (not just path params).
  - Body-based allow/deny detection (200-with-error-body).
  - Rate-limit/429 handling with backoff; `--rate` cap.
  - A coverage report: which operations were probed vs. skipped, and why.
- **Outcome:** Fewer false negatives/positives; users trust the results.

### 5. `authzprobe init` — guided config scaffolding
- **Size:** 🟢 ~90 hrs · **Difficulty:** Beginner
- **Skills:** TypeScript, CLI UX
- **Mentor:** _<MENTOR>_
- **Deliverables:** An interactive command that reads a spec, enumerates path
  params and security schemes, and generates a well-commented `identities.yaml`
  skeleton for the user to fill in.
- **Outcome:** First-run time drops from "read the docs" to "answer a few prompts".

---

Mentors: keep this list current each program cycle — adjust sizes, claim ideas,
and mark ones already in progress. New ideas welcome via PR.
