# Phase 7 Student E-Booklet Code Redemption — Critique Report

Verdict: APPROVED

## Review scope

Reviewed the Phase 7 handoff and inspected the relevant frontend/backend changes for direct student e-booklet access-code redemption, with particular focus on the required business rule:

- Free shared e-booklet codes must track entry only.
- Free shared codes must not grant viewer access.
- Free shared codes must not count toward paid milestone progress.
- Paid codes grant viewer access and bind to the first redeeming student.

## Files inspected

- `.hermes/reviews/phase-7-student-code-redemption/handoff.md`
- `frontend/src/App.jsx`
- `frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx`
- `frontend/src/hooks/useEBookletAccess.js`
- `frontend/src/pages/student/e-booklets/StudentEBookletsPage.jsx`
- `frontend/src/locales/en/eBooklets.json`
- `frontend/src/locales/ar/eBooklets.json`
- `frontend/tests/e-booklet-phase7-source-check.mjs`
- `backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- `backend/src/apps/store-api/services/e-booklet-redemption.service.ts`
- `backend/tests/e-booklet/e-booklet-phase2-services.spec.ts`

## Verification performed

Ran targeted verification:

```sh
node frontend/tests/e-booklet-phase7-source-check.mjs && cd backend && npm test -- --runTestsByPath tests/e-booklet/e-booklet-phase2-services.spec.ts --runInBand
```

Result: PASS

- Source contract check passed.
- Backend service test suite passed: 21 tests, 1 suite.

## Findings

### 1. Student code redemption route and UI are present

`frontend/src/App.jsx` registers `/e-booklet-code` using `AcceptEBookletInvitePage mode="code"`. The page gates unauthenticated users with login/register links and preserves the redirect back to `/e-booklet-code`.

In code mode, `AcceptEBookletInvitePage.jsx` renders a dedicated code form, requires terms acceptance, calls `redeemAccessCode`, and avoids rendering invite-specific offline passcode / online purchase choices. This addresses the review focus about not exposing paid checkout paths from the code redemption surface.

### 2. Frontend redemption API call is correctly wired

`useStudentEBooklets().redeemAccessCode` posts to `/e-booklet-access-codes/redeem` with Axios `data` containing:

- `code`
- `termsAccepted: true`
- `termsVersion`

This matches the backend controller expectation and avoids the common bug of using an unsupported `body` key with the existing `useApiMutation` helper.

### 3. Paid/free frontend success branching is acceptable

The page branches on backend `counted_for_progress`:

- If `counted_for_progress` is true and an instance id is returned, it navigates to `/student/e-booklets/:instanceId`.
- Otherwise it remains on the redemption page and displays tracking-only copy for free shared codes.

This is consistent with the required semantics. The paid-success message is only shown as fallback if backend marks the redemption as counted but does not return an instance id; normal paid success redirects to the viewer.

### 4. Backend free shared code semantics satisfy the business rule

`EBookletRedemptionService.redeemCode` computes `isPaid = code.kind === "paid"` and only calls `grantViewerAccess` when `isPaid` is true:

```ts
const access = isPaid ? await this.grantViewerAccess(tx, code, studentId) : null;
```

The redemption row then persists:

```ts
access_id: access?.id ?? null,
paid_redemption_guard: isPaid ? `paid-code-${code.id}` : null,
counted_for_progress: isPaid,
```

Therefore free shared codes create a tracking redemption with `access_id=null` and `counted_for_progress=false`; they do not create or upsert `e_booklet_access` viewer access and do not contribute to milestone progress.

The backend service test explicitly covers this and asserts `e_booklet_access.upsert` is not called for free shared codes.

### 5. Paid code first-student binding is enforced

Paid code redemption:

- Reserves capacity via `updateMany` with `status: "active"`, remaining capacity, and `bound_student_id: null` for paid codes.
- Sets `bound_student_id` to the redeeming student.
- Sets paid code status to `redeemed`.
- Grants viewer access via `e_booklet_access.upsert`.
- Returns existing redemption for the same student if already redeemed.
- Rejects a different student when `bound_student_id` belongs to someone else.

The targeted backend test covers first redemption, same-student repeat, and different-student rejection.

### 6. Milestone counting remains paid-only

The backend milestone tests assert milestone progress counts redemptions with:

```ts
{
  counted_for_progress: true,
  access_code: { teacher_id: 9, term_id: 1, kind: "paid" }
}
```

This provides a second guard against free shared code redemptions affecting paid milestone progress.

## Non-blocking notes

- The frontend source-contract test is useful as a lightweight regression check, but it is regex/source based rather than a real React interaction test. Given the handoff notes that no proper React test harness exists, this is acceptable for this phase but should not replace future component/e2e tests.
- `AcceptEBookletInvitePage mode="code"` as a route element prop is valid for React Router usage here and keeps the implementation compact. A separate page component could improve separation later, but this is not required.

## Required fixes

None.
