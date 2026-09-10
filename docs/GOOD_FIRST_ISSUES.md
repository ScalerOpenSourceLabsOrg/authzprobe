# Good First Issues

Small, well-scoped tasks to land your first contribution. Each touches only a
file or two and has clear acceptance criteria. Read
[`CONTRIBUTING.md`](../CONTRIBUTING.md) and [`ARCHITECTURE.md`](./ARCHITECTURE.md)
first, then comment `/assign` on the matching GitHub issue.

For larger, project-sized work (GSoC / semester projects), see
[`GSOC_IDEAS.md`](./GSOC_IDEAS.md).

## 🟢 Starter

1. **`--only <kind>` filter.** Add a flag to run just `bola`, `bfla`, or
   `baseline`. Touch `cli.ts` + `plan.ts`. *Done when:* planning with the filter
   yields only that kind, covered by a test.
2. **JUnit XML report.** Add `report/junit.ts` producing JUnit XML alongside the
   JSON so CI renders findings as failed test cases. Wire a `--junit <file>` flag.
3. **Per-operation `denyStatuses`.** Allow overriding accepted deny codes for a
   single operation (some APIs return 200 with an error body — see #7).
4. **Richer `--dry-run` output.** Print the full planned request table grouped by
   kind, with counts, so people can review coverage before sending anything.
5. **`--dry-run` without secrets.** In dry-run we send nothing, so a missing
   `${ENV}` token shouldn't be fatal. Make interpolation lenient in dry-run only.

## 🟡 Intermediate

6. **Query-param object references.** Extend `plan.ts` to detect object ids
   passed as *query* params (e.g. `GET /orders?userId=...`), not just path
   params, and substitute from `owns`.
7. **Response-body allow/deny detection.** Some APIs return `200` with
   `{ "error": "forbidden" }`. Add optional body matchers so those aren't false
   FAILs (`evaluate.ts`).
8. **Rate-limit handling.** Respect `429` / `Retry-After` in `replay.ts` with a
   small backoff, and add a `--rate <rps>` cap.
9. **securityScheme awareness.** Read the spec's `securitySchemes` and warn when
   the config's auth type doesn't match what the operation expects.

## 🔴 Ambitious

10. **`authzprobe init`.** A command that reads the spec, lists every path param,
    and scaffolds a starter `identities.yaml` for the user to fill in.
11. **Stateful / sequence BOLA.** Create a resource as identity A (POST, behind
    `--include-unsafe`), capture the returned id, then read it as identity B — no
    pre-declared ownership required.
12. **HTML report** with per-finding remediation guidance and OWASP references.
13. **GitHub Action wrapper** so `uses: ScalerOpenSourceLabsOrg/authzprobe-action@v1` runs a scan
    in any repo's CI.
