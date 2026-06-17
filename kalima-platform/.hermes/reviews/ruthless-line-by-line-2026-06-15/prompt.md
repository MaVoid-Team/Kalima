You are the RUTHLESS REVIEWER. The user explicitly requested a background reviewer that goes through all code written LINE BY LINE, explicitly line by line.

Repository root: /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform

Your task:
1. Inspect the current dirty worktree from disk. Do NOT rely on any implementer summary.
2. Review every changed/created/deleted file shown by `git status --short` line by line. Include generated files, migrations, tests, frontend, backend, locales, docs/handoffs/reports if changed. No skipping.
3. For every modified/created source file, read the actual file contents and inspect line-by-line. For deleted files, inspect the deletion diff.
4. Produce a file-by-file verdict for EVERY dirty file. If a dirty file is unrelated or generated, still list it and state exactly how you handled it.
5. Find blockers: security, authorization/role bugs, DB/Prisma contract mismatches, route/controller/service payload mismatches, frontend/backend API shape mismatches, logic contradictions, missing required tests, false proof/stale tracker claims, broken imports, generated-client/schema inconsistency, i18n key issues, and user-facing copy that contradicts business rules.
6. Required business context for Kalima e-booklets: students redeem URL + code while logged in; teacher can generate/copy code or Arabic WhatsApp URL+code; paid codes grant/open access and count for paid seats/milestones; free shared codes also grant/open booklet access and track logged-in entry but do not count toward paid seats or milestones; rewards are non-expiring teacher wallet credit and not stackable with coupons; terms are required before code generation and reward claim.
7. Be ruthless and explicit. Findings must include file:line, severity, why it is wrong, and exact required fix.
8. If you cannot complete the full line-by-line review, verdict MUST be REQUIRED_FIXES and you must state exactly which files were not reviewed.
9. Run targeted verification where practical, but do not spend all time on tests instead of line-by-line reading.
10. Do NOT modify implementation files. Only write the report.

Output path:
/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/.hermes/reviews/ruthless-line-by-line-2026-06-15/report.md

Report required structure:
# Ruthless Line-by-Line Review
Verdict: APPROVED or REQUIRED_FIXES

## Dirty files reviewed
- one bullet per dirty file, no omissions, with verdict for that file

## Blocking findings
- file:line — severity — finding — required fix

## Non-blocking findings
- file:line — finding

## Verification run
- commands run and exact pass/fail summary

## Review completeness statement
Explicitly state whether every dirty file was reviewed line-by-line. If not, verdict must be REQUIRED_FIXES.

Start by running `git status --short` and capturing the dirty file list yourself.