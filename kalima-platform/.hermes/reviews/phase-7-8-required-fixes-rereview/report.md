# Phase 7/8 Required Fixes Re-review

Verdict: APPROVED

## Line-by-line findings

### backend/src/apps/store-api/services/e-booklet.service.ts

Reviewed line ranges: 1650-1685, 1695-1810, 2018-2093, 2267-2384.

1. Page views recorded when `getViewerPage` serves a valid page: FIXED.
- Lines 2047-2054 assert viewer access and reject invalid page numbers before recording analytics.
- Lines 2056-2065 create the existing audit log for a valid page view.
- Lines 2066-2075 now call `recordAnalyticsEvent` with `event_type: "page_viewed"`, teacher/student/template/instance/access/source dimensions, and metadata limited to `{ page_number: pageNumber }`.
- Lines 2076-2084 create the short-lived page access token only after the analytics event payload is built; the analytics metadata does not include the token.
- Sanitization check: the page-view analytics payload contains no raw token, passcode, or private storage key fields. `recordAnalyticsEvent` also strips passcode/ip/user-agent fields at lines 2267-2279 and metadata redaction strips passcode/ip/user-agent fields at lines 2286-2288.

2. Device-bound metric recorded for newly created or reactivated viewer devices: FIXED.
- Lines 1705-1724 return early for an already-active same device, updating only last-seen/user-agent/ip and not recording a duplicate `device_bound` event.
- Lines 1743-1774 reactivate a non-active reusable device and record `event_type: "device_bound"` with teacher/student/template/instance/access/source dimensions and metadata `{ device_label_present, binding_type: "reactivated" }`.
- Lines 1776-1801 create a first active device and record `event_type: "device_bound"` with the same dimensions and metadata `{ device_label_present, binding_type: "created" }`.
- Sanitization check: raw `deviceFingerprint` is written only to `e_booklet_devices` at line 1781 and is not passed into analytics. Device analytics metadata does not include fingerprint, token, passcode, or private storage key fields. `ipAddress`/`userAgent` are passed to the recorder for redacted security metadata only and stripped from top-level analytics data by lines 2267-2279.

4. Teacher analytics scoping no longer trusts denormalized analytics `teacher_id` alone for `instanceId` filtering: FIXED.
- Lines 2312-2318 first query source-of-truth `e_booklet_instances` with `where: { teacher_id: teacherId, ...(filters.instanceId ? { id: filters.instanceId } : {}) }` and select owned instance IDs before analytics aggregation.
- Lines 2319-2321 throw `ForbiddenError` when a requested `instanceId` is not in the teacher-owned source-of-truth result set.
- Lines 2322-2324 derive `ownedInstanceIds` from `e_booklet_instances` and force `where.booklet_instance_id = { in: ownedInstanceIds }` before all analytics groupBy/aggregate calls.
- Lines 2325-2332 use that constrained `where` for events, sources, revenue, invite opens, anonymous visitors, and failed passcodes. The analytics `teacher_id` filter remains present, but it is no longer the sole scope boundary; owned source-of-truth instance IDs are required.

### backend/src/apps/store-api/routes/v2/e-booklet.routes.ts

Reviewed line ranges: 1-35, 220-233.

3. Admin analytics and CSV export no longer allow Moderator: FIXED.
- Lines 16-19 still define broad `adminAuth` including Moderator for other admin routes.
- Lines 21-24 define `adminManagerAuth` as Admin/SubAdmin only.
- Lines 224-228 gate `/admin/e-booklet-analytics` with `...adminManagerAuth`.
- Lines 229-233 gate `/admin/e-booklet-analytics.csv` with `...adminManagerAuth`.
- Moderator is therefore excluded from both admin analytics and CSV export routes.

### backend/tests/e-booklet/e-booklet.service.spec.ts

Reviewed line ranges: 760-810, 830-886, 1360-1454.

- Lines 780-810 assert first device binding records `device_bound` with teacher/student/template/instance/access/source dimensions and sanitized metadata. The test covers the newly-created device path and line 762-778 covers the existing-active path behavior.
- Lines 831-864 assert analytics rows do not contain a raw wrong passcode and teacher analytics uses `booklet_instance_id: { in: [10] }`.
- Lines 866-886 assert teacher analytics resolves source-of-truth owned instances via `e_booklet_instances.findMany({ where: { teacher_id: 9, id: 10 } })` before aggregating, and aggregates with `booklet_instance_id: { in: [10] }` instead of a bare denormalized instance filter.
- Lines 1386-1454 assert valid viewer page access records `page_viewed` analytics with teacher/student/template/instance/access/source dimensions and `{ page_number: 2 }` metadata, then rejects an out-of-range page request.

### backend/tests/e-booklet/e-booklet.routes.spec.ts

Reviewed line ranges: 60-99, 392-428.

- Lines 75-77 include mocked teacher/admin analytics and CSV service methods.
- Lines 99-100 include a `Moderator` token role for route authorization tests.
- Lines 406-414 assert Admin can call admin analytics and CSV export.
- Lines 415-422 assert Moderator receives 403 for both `/api/v2/admin/e-booklet-analytics?teacher_id=9` and `/api/v2/admin/e-booklet-analytics.csv`.
- Lines 424-427 confirm the expected analytics service calls are reached for allowed requests.

## Required fixes

None.

## Verification

- PASS: `cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/backend && npm run build && npm test -- --runInBand tests/e-booklet`
  - `tsc` passed.
  - Jest passed: 6 test suites passed, 128 tests passed.
  - Non-blocking warning: `ts-jest` `isolatedModules` config option is deprecated.

- PASS: `cd /Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform/frontend && npm run lint && npm run build`
  - ESLint passed.
  - Vite build passed.
  - Non-blocking warnings: Node `module.register()` deprecation, `crypto` externalized for `@embedpdf/snippet`, and chunk-size warning for chunks larger than 1600 kB.
