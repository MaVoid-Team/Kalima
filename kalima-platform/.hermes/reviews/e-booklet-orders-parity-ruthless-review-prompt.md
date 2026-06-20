You are an independent ruthless code reviewer. Review only the e-booklet orders parity implementation in this dirty repository. Do not modify files.

Scope files:
- kalima-platform/frontend/src/pages/e-booklets/eBookletOrdersContract.mjs
- kalima-platform/frontend/src/hooks/useEBooklets.js
- kalima-platform/frontend/src/pages/e-booklets/EBookletOrdersPage.jsx
- kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletPurchasesPage.jsx
- kalima-platform/frontend/src/components/e-booklets/EBookletOrderCard.jsx
- kalima-platform/frontend/src/components/e-booklets/EBookletOrderDetailsDialog.jsx
- kalima-platform/frontend/src/components/e-booklets/EBookletOrderItemsCollapsible.jsx
- kalima-platform/frontend/src/components/e-booklets/eBookletOrderUtils.js
- kalima-platform/frontend/src/locales/en/eBooklets.json
- kalima-platform/frontend/src/locales/ar/eBooklets.json
- kalima-platform/docs/specs/e-booklet-orders-parity-spec.md

Context:
- Goal was to make /e-booklet-orders visually/functionally match /teacher/orders while preserving e-booklet-specific data and actions.
- Admin /admin/e-booklets/orders should share e-booklet order statuses with teacher side.
- Known important behavior: "all" is UI-only and must not be sent as status=all; "delivered" must be supported.
- Build and lint passed before this review.

Review instructions:
- Read every line in the scoped implementation.
- Prioritize bugs, behavioral regressions, bad hook dependencies/refetch loops, status/action mismatches, missing i18n keys, route/link mistakes, accessibility issues, and unsafe assumptions about e-booklet payload shape.
- Ignore unrelated dirty files outside scope unless they directly affect these files.
- Report findings first, ordered by severity, with exact file/line references.
- If no findings, say that explicitly and list residual risks.
- Do not make edits.
