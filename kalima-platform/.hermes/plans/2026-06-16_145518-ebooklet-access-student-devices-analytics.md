# E-Booklet Access Student Devices + Analytics Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Change the admin eBooklet Access / Instances page so a teacher’s e-booklet expands into student rows, each student row shows access/device analytics and inline device management actions.

**Architecture:** Reuse the existing admin instance grouping and existing device endpoints, but move device selection/control from a separate instance-level devices page into a per-student nested row/component. Extend `listInstanceStudents` to return the fields the nested UI needs in one request: student identity, access metadata, active devices, allowance, and lightweight per-student analytics. Keep the old `/admin/e-booklet-instances/:instanceId/devices` route as a fallback/deep-link unless the user later says to remove it.

**Tech Stack:** React/Vite frontend, existing shadcn-style UI components, `useApiMutation`, Express/TypeScript backend, Prisma DB, Jest backend tests, i18next translations.

---

## Decision defaults / assumptions

- “Kanima” means the local Kalima repo at `/Users/ziadnasreldin/Documents/GitHub/Kalima/kalima-platform`.
- Target page is `frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx` (`/admin/e-booklet-instances`), currently grouped by teacher with e-booklet rows and a separate Devices button.
- “Teacher details page” means the teacher group/section on the admin access page, not a new route.
- Student rows should appear under each e-booklet row after expansion, not replace the teacher grouping.
- “Students who actually bought the ebooklet” means active student access records for that `e_booklet_instance`; this includes approved online purchases and offline/passcode access records when they create real student access. Anonymous invite opens do **not** count as bought students.
- Inline device controls should support the current admin actions: view active devices, reset devices, and change allowed device count with a reason.
- Analytics beside each student should be compact operational metrics: access source, granted date, active devices count, allowed devices, last device seen, invite/view/device event counts where available, and revenue/source fields only if already captured safely.
- Keep raw IP/user-agent visible only inside the expanded device details, matching existing admin-only devices page behavior.

## Current code inventory

### Frontend

- `frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx`
  - Current page groups `instances` by teacher.
  - Each teacher section renders a table of e-booklet instances.
  - Devices currently navigate to `/admin/e-booklet-instances/${instance.id}/devices`.
- `frontend/src/pages/admin/e-booklets/AdminEBookletDevicesPage.jsx`
  - Current separate page already loads `students`, selected `devices`, `reason`, `allowedDevices` and exposes Reset / Allow actions.
  - This logic should be extracted/reused, not duplicated manually.
- `frontend/src/hooks/admin/useAdminEBooklets.js`
  - `useAdminEBookletInstances()` calls `GET /admin/e-booklet-instances`.
  - `useAdminEBookletDevices()` calls:
    - `GET /admin/e-booklet-instances/:instanceId/students`
    - `GET /admin/e-booklet-instances/:instanceId/users/:userId/devices`
    - `POST /admin/e-booklet-instances/:instanceId/users/:userId/devices/reset`
    - `POST /admin/e-booklet-instances/:instanceId/users/:userId/device-allowance`
  - Existing `setDiscoveredStudents` can support preloading if needed.
- `frontend/src/App.jsx`
  - Routes include `/admin/e-booklet-instances`, `/admin/e-booklet-instances/:instanceId/view`, and `/admin/e-booklet-instances/:instanceId/devices`.
- `frontend/public/locales/en/eBooklets.json` and `frontend/public/locales/ar/eBooklets.json` or equivalent eBooklets namespace files
  - Need labels for expand students, student analytics, inline devices, reset/allow messages, empty student rows.

### Backend

- `backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
  - Existing admin routes already expose instance students and device actions.
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
  - `listInstances`, `listInstanceStudents`, `listViewerDevices`, `resetViewerDevices`, `addDeviceAllowance`, `adminAnalytics` already exist.
- `backend/src/apps/store-api/services/e-booklet.service.ts`
  - `listInstances()` includes teacher, template/version, counts, and active device count.
  - `listInstanceStudents()` currently returns `e_booklet_access` with only `user: { id, name, email }`.
  - `listViewerDevices()` returns active devices for one student/instance.
  - `addDeviceAllowance()` upserts per-student allowance.
  - `getAdminAnalytics()` supports filters including `instanceId` and `studentId`, but the page needs inline summary data without N+1 API calls.
- `backend/tests/e-booklet/e-booklet.service.spec.ts`
  - Existing mock DB and service tests are the best place for new unit coverage.

## Proposed UX

1. Keep the top-level teacher sections.
2. Keep the e-booklet row in each teacher section, but change the Devices button into an Expand / Students control.
3. When expanded, render a nested student table under that e-booklet row:
   - Student: name/email/user ID.
   - Access: status, source, granted date.
   - Analytics: event counts / views / invite source / revenue-safe source fields if available.
   - Devices summary: active devices count, allowed devices, last seen.
   - Actions: inline Manage Devices expander.
4. When a student’s Manage Devices area is open, show:
   - Active device list.
   - Reason input.
   - Allowed devices input.
   - Allow / Update allowance button.
   - Reset devices button.
   - Refresh devices button.
5. Preserve the old separate devices route for direct troubleshooting and as a safe fallback.

## Data/API plan

### Preferred backend enhancement

Extend `GET /admin/e-booklet-instances/:instanceId/students` response so each access row includes:

```ts
{
  id: number;
  user_id: number;
  booklet_instance_id: number;
  role: "student";
  status: string;
  access_source?: string | null;
  granted_at?: string | Date | null;
  revoked_at?: string | Date | null;
  user: { id: number; name: string | null; email: string | null };
  devices_summary: {
    active_count: number;
    total_count: number;
    last_seen_at: string | Date | null;
    allowed_devices: number;
  };
  analytics_summary: {
    invite_opened: number;
    access_created: number;
    viewer_opened: number;
    page_viewed: number;
    device_bound: number;
    source?: string | null;
    marketing_price_snapshot?: string | number | null;
  };
}
```

Implementation note: do not call `getAdminAnalytics()` per student from the frontend. Aggregate devices/allowances/events in `EBookletService.listInstanceStudents()` to avoid N+1 network calls. A small number of Prisma queries grouped by `user_id` is acceptable.

## Step-by-step plan

### Task 1: Add failing backend tests for enriched student rows

**Objective:** Lock the required `listInstanceStudents()` shape before changing service code.

**Files:**
- Modify: `backend/tests/e-booklet/e-booklet.service.spec.ts`

**Steps:**
1. Add mock DB methods if missing:
   - `e_booklet_devices.groupBy` or `findMany`
   - `e_booklet_device_allowances.findMany`
   - `e_booklet_analytics_events.groupBy`
2. Add a test under a new `describe("listInstanceStudents")` block:
   - Mock instance exists.
   - Mock two active student access records.
   - Mock active devices and allowance rows.
   - Mock analytics event group counts by `student_id` and `event_type`.
3. Assert returned rows contain `devices_summary` and `analytics_summary` per student.
4. Add a second test proving teacher-scoped calls still reject when the instance does not belong to the teacher.

**Run:**
```bash
cd backend && npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts
```
Expected before implementation: FAIL because fields are missing.

### Task 2: Enrich `listInstanceStudents()` in the backend service

**Objective:** Return student access records with device and analytics summaries in one endpoint.

**Files:**
- Modify: `backend/src/apps/store-api/services/e-booklet.service.ts:1567-1584`

**Steps:**
1. Keep the existing instance ownership check.
2. Fetch access rows for `booklet_instance_id`, `role: "student"`, and preferably `status: "active"` unless revoked students must remain visible.
3. Collect `studentIds` from access rows.
4. Query active/total devices for those students and instance.
5. Query device allowances for those students and instance.
6. Query analytics events grouped by `student_id` and `event_type` for that instance.
7. Return the same access rows plus `devices_summary` and `analytics_summary`.
8. Default `allowed_devices` to `1` when no allowance row exists, matching `bindViewerDevice()`.
9. Do not expose raw IP/user-agent in the student list response.

**Run:**
```bash
cd backend && npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts
```
Expected: new `listInstanceStudents` tests pass.

### Task 3: Extract reusable inline devices component

**Objective:** Reuse the current devices page behavior inside student rows without copying all logic into the table.

**Files:**
- Create: `frontend/src/pages/admin/e-booklets/components/AdminEBookletStudentDevicesPanel.jsx`
- Modify: `frontend/src/pages/admin/e-booklets/AdminEBookletDevicesPage.jsx`

**Component props:**
```jsx
<AdminEBookletStudentDevicesPanel
  instanceId={instance.id}
  student={studentRow}
  defaultAllowedDevices={studentRow.devices_summary?.allowed_devices ?? 1}
  compact
/>
```

**Panel behavior:**
- Fetch devices only when opened/mounted for a specific student.
- Show active devices list using the existing fields from `listViewerDevices()`.
- Include reason input and allowed devices input.
- Call existing `resetDevices()` and `addDeviceAllowance()` functions.
- Refresh device list and call optional `onChanged()` after actions so the parent student summary can refresh.

**Refactor:**
- Keep `AdminEBookletDevicesPage.jsx` working by using the same panel for the selected student instead of owning all device UI directly.

**Run:**
```bash
cd frontend && npm run lint
```
Expected: no new lint errors.

### Task 4: Add expandable student rows under each e-booklet instance

**Objective:** Put the device management page/functionality inside the per-student loop under each e-booklet row.

**Files:**
- Modify: `frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx`
- Modify: `frontend/src/hooks/admin/useAdminEBooklets.js` if a helper hook is needed for per-instance student caching.

**Steps:**
1. Add state:
   - `expandedInstanceIds`
   - `studentsByInstanceId`
   - `studentLoadingByInstanceId`
2. On Expand Students click:
   - Toggle the instance.
   - If opening and not loaded/stale, call `fetchStudents(instance.id)`.
3. Render a second `<tr>` under the e-booklet row with `colSpan` equal to the main table column count.
4. Inside the nested area, render student rows from `studentsByInstanceId[instance.id]`.
5. For each student row show:
   - name/email/user ID
   - access status/source/granted date
   - analytics badges/counts
   - devices summary
   - Manage Devices button/expander
6. Render `AdminEBookletStudentDevicesPanel` inside the expanded student row.
7. Replace the current Devices navigation button with inline expand action, but keep a smaller “Open full page” link in the expanded area for fallback.
8. Ensure empty state says no students bought/redeemed this e-booklet yet.

**Important UI constraints:**
- Avoid nesting full-width tables in a way that breaks horizontal scroll; use a compact nested card/table inside the `colSpan` row.
- Arabic/RTL labels must come from translations.
- Do not show anonymous analytics as students.

**Run:**
```bash
cd frontend && npm run lint
cd frontend && npm run build
```
Expected: lint/build pass.

### Task 5: Add/adjust frontend translations

**Objective:** Keep EN/AR admin UI readable and avoid hardcoded strings.

**Files likely to change:**
- `frontend/public/locales/en/eBooklets.json` or the existing eBooklets namespace file
- `frontend/public/locales/ar/eBooklets.json` or the existing eBooklets namespace file

**Keys to add under `admin.instances` / `admin.devices`:**
- `showStudents`
- `hideStudents`
- `studentsForEBooklet`
- `studentsLoading`
- `studentsEmpty`
- `studentAnalytics`
- `accessSource`
- `grantedAt`
- `activeDevices`
- `allowedDevices`
- `lastSeen`
- `manageDevicesInline`
- `openFullDevicesPage`

**Run:**
```bash
cd frontend && npm run build
```
Expected: no missing import/build errors.

### Task 6: Add route/API regression coverage

**Objective:** Verify the existing admin endpoint remains protected and returns the enriched response.

**Files:**
- Modify: `backend/tests/e-booklet/e-booklet.routes.spec.ts` if route harness supports this endpoint.
- Otherwise keep service-level tests and add a controller test only if existing patterns make it cheap.

**Cases:**
- Admin can call `GET /admin/e-booklet-instances/:instanceId/students`.
- Teacher can call `/teacher/e-booklets/:instanceId/students` only for their own instance and should get the same safe summaries.
- Non-owner teacher is rejected.
- Raw device fingerprints/IP/user-agent are not included in list response.

**Run:**
```bash
cd backend && npm test -- --runInBand tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet.service.spec.ts
```
Expected: pass.

### Task 7: Manual/local verification

**Objective:** Prove the requested workflow works in the app, not just in unit tests.

**Steps:**
1. Start backend/frontend using repo scripts if not already running:
   - `cd backend && npm run dev`
   - `cd frontend && npm run dev`
2. Login as Admin/SubAdmin.
3. Open `/admin/e-booklet-instances`.
4. Confirm teacher sections still show.
5. Expand a teacher’s e-booklet.
6. Confirm student buyers/access records show as rows.
7. Expand Manage Devices for one student.
8. Confirm current devices list appears.
9. Change allowed device count with a reason; refresh and confirm it persists.
10. Reset devices with a reason; confirm devices list updates.
11. Confirm analytics badges/counts update or display truthful zeroes.
12. Check Arabic UI for layout/RTL regressions.

## Files likely to change

- `backend/src/apps/store-api/services/e-booklet.service.ts`
- `backend/tests/e-booklet/e-booklet.service.spec.ts`
- `backend/tests/e-booklet/e-booklet.routes.spec.ts` (optional but preferred)
- `frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx`
- `frontend/src/pages/admin/e-booklets/AdminEBookletDevicesPage.jsx`
- `frontend/src/pages/admin/e-booklets/components/AdminEBookletStudentDevicesPanel.jsx`
- `frontend/src/hooks/admin/useAdminEBooklets.js`
- `frontend/public/locales/en/eBooklets.json` or actual eBooklets namespace file
- `frontend/public/locales/ar/eBooklets.json` or actual eBooklets namespace file

## Validation commands

```bash
cd backend && npm test -- --runInBand tests/e-booklet/e-booklet.service.spec.ts
cd backend && npm test -- --runInBand tests/e-booklet/e-booklet.routes.spec.ts tests/e-booklet/e-booklet.service.spec.ts
cd backend && npm run build
cd frontend && npm run lint
cd frontend && npm run build
```

## Risks / tradeoffs

- **N+1 frontend calls:** Avoid calling student analytics/device endpoints per row on initial page load. Load students per expanded instance and devices only per expanded student.
- **Large teacher sections:** If an e-booklet has many students, add pagination/search later. For this change, keep the request bounded by current access counts unless data is huge.
- **Meaning of “bought”:** The backend access table is the source of truth. Anonymous invite opens and pending payment proofs should not show as bought students.
- **Analytics privacy:** Student row should show counts and safe revenue/source metadata only; raw IP/user-agent stays limited to admin device detail panel.
- **Existing full devices page:** Keep it to avoid breaking bookmarks/admin workflows.

## Open question before implementation

One thing to confirm before coding: should revoked/archived student access rows appear in the nested student list, or only active students who currently have access?

Recommended default: show only active student access rows, with analytics based on that active access.
