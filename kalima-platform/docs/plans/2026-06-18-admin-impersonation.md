# Admin Impersonation Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Add an Admin-only impersonation feature in Kalima so an Admin can switch into any non-admin user account from the admin sidebar, then safely return to the original Admin session.

**Architecture:** Mirror the proven Fekra flow but adapt it to Kalima’s current v2 TypeScript auth stack and portal-access model. Backend mints a short-lived impersonated access token that carries impersonation metadata while preserving the original admin identity in the token metadata; frontend stores a small local impersonation session, shows an always-visible banner/exit action, and routes based on the impersonated role.

**Tech Stack:** Express + TypeScript + Prisma/PostgreSQL backend (`backend/src/apps/store-api`), React/Vite frontend (`frontend/src`), JWT access tokens + refresh tokens, `localStorage` session state, existing admin users API.

---

## Reference: how Fekra does it

Inspected Fekra at `/Users/ziadnasreldin/Documents/GitHub/fekra/kalima-platform`.

Backend:
- `backend/routes/authRoutes.js` adds:
  - `POST /auth/impersonation/start`
  - `POST /auth/impersonation/stop`
- `backend/controllers/authController.js`:
  - validates `targetUserId` + `targetRole`
  - rejects nested impersonation
  - checks role policy via `canImpersonate()`
  - verifies target exists and role matches
  - signs a new access token as the target user with an `impersonation` object containing actor/target/session metadata
  - logs `IMPERSONATION_STARTED` and `IMPERSONATION_ENDED` to audit logs
  - `stopImpersonation` reads token metadata and returns a fresh access token for the actor
- `backend/utils/tokens/generateTokens.js` accepts extra access-token payload metadata.

Frontend:
- `frontend/src/routes/auth-services.jsx` stores `impersonationSession` in localStorage, exposes `startImpersonation()` / `stopImpersonation()`, and emits `impersonation-changed` + `user-auth-changed` events.
- `frontend/src/components/UnifiedSidebar.jsx` owns the modal/list/search flow and exit action.
- `frontend/src/App.jsx` shows a global banner while impersonating.

## Kalima current-state findings

Backend:
- Current v2 auth routes: `backend/src/apps/store-api/routes/v2/auth.routes.ts`.
- Current auth controller/service: `backend/src/apps/store-api/controllers/auth.controller.ts`, `backend/src/apps/store-api/services/auth.service.ts`.
- Current JWT helpers: `backend/src/libs/auth/jwt.ts` with payload `{ userId, roles }`.
- Current auth middleware: `backend/src/libs/auth/middleware.ts` attaches verified token payload to `req.user`.
- Current role enum includes the requested roles: `Admin`, `SubAdmin`, `Teacher`, `Student`, `Moderator` in `backend/src/apps/store-api/prisma/schema.prisma`.
- Existing admin users listing surface: `backend/src/apps/store-api/routes/v2/admin.routes.ts`, `controllers/admin.controller.ts`, `services/user-management.service.ts`.

Frontend:
- Admin sidebar: `frontend/src/components/admin/Sidebar.jsx`.
- Admin layout: `frontend/src/layouts/AdminLayout.jsx`.
- Routes: `frontend/src/App.jsx`; admin routes currently allow `Admin` and `SubAdmin`.
- Auth state: `frontend/src/contexts/AuthContext.jsx`.
- Role checks: `frontend/src/hooks/useRole.js`, `frontend/src/components/RoleRoute.jsx`.
- API client/refresh flow: `frontend/src/api/axios.js`.
- Logout utility: `frontend/src/lib/authUtils.js`.
- Users page/hooks/table: `frontend/src/pages/admin/users/UsersPage.jsx`, `frontend/src/hooks/admin/useAdminUsers.js`, `frontend/src/components/admin/users/UsersTable.jsx`.

## Product decisions for v1

- Entry point appears for Admin and SubAdmin inside the admin sidebar.
- Admin/SubAdmin can impersonate any other user account, regardless of role.
- Do not allow impersonating your own current account.
- Do not allow nested impersonation.
- While impersonating, permission checks should behave as the target user, not as admin override.
- A persistent visible banner and “Exit impersonation” action are required.
- Stop impersonation restores the original Admin token/session.
- Start/stop must be audit-logged.
- Existing refresh-token flow should be treated carefully: for v1, do not mint a target refresh token; either preserve actor refresh token and refresh back to actor, or make impersonated access-token sessions exit/expire safely. Prefer explicit stop and clear local impersonation state on full logout.

---

## Implementation tasks

### Task 1: Extend JWT payload for impersonation metadata

**Objective:** Allow access tokens to carry actor/target/session metadata without changing normal login behavior.

**Files:**
- Modify: `backend/src/libs/auth/jwt.ts`
- Test: `backend/src/libs/auth/jwt.impersonation.spec.ts` or nearest existing JWT/auth test file

**Steps:**
1. Add `ImpersonationPayload` interface with: `isActive`, `sessionId`, `actorUserId`, `actorRoles`, `actorName`, `targetUserId`, `targetRole`, `targetName`, `startedAt`.
2. Add optional `impersonation?: ImpersonationPayload` to `AccessTokenPayload`.
3. Add tests that `signAccessToken({ userId, roles, impersonation })` round-trips through `verifyAccessToken()`.
4. Run: `cd backend && npm test -- jwt` if a matching test pattern exists; otherwise run `cd backend && npm test -- --runInBand`.

### Task 2: Add backend impersonation DTO validation

**Objective:** Validate start/stop request bodies consistently with existing auth DTOs.

**Files:**
- Modify: `backend/src/apps/store-api/dtos/auth.dto.ts`

**Steps:**
1. Add `StartImpersonationDto` with `targetUserId: number` and `targetRole: role_enum`.
2. Add `StopImpersonationDto` with optional/required `sessionId: string`.
3. Use `class-validator` decorators matching existing DTO style.

### Task 3: Implement backend policy helpers

**Objective:** Centralize v1 impersonation rules.

**Files:**
- Create: `backend/src/apps/store-api/services/impersonation-policy.ts`
- Test: `backend/src/apps/store-api/services/impersonation-policy.spec.ts`

**Rules:**
- Actor must include role `Admin` or `SubAdmin` in token/user roles.
- Targets allowed: every user role/account except the actor's own account.
- Targets blocked: self only.
- Nested impersonation blocked if token has `impersonation`.

### Task 4: Implement backend service methods

**Objective:** Start and stop impersonation securely.

**Files:**
- Modify: `backend/src/apps/store-api/services/auth.service.ts`
- Possibly modify: `backend/src/apps/store-api/services/user-management.service.ts` only if target lookup needs a reusable selector.

**Start flow:**
1. Accept actor token payload + `targetUserId` + `targetRole`.
2. Load actor from DB and confirm active Admin role.
3. Load target user with `user_roles` and public display fields.
4. Verify requested role exists on target.
5. Generate `sessionId = crypto.randomUUID()` and `startedAt`.
6. Sign access token as target: `signAccessToken({ userId: target.id, roles: targetRoles, impersonation })`.
7. Return `{ tokens: { accessToken }, user: targetUserSummary, portalAccess: targetPortalAccess, impersonation }`.

**Stop flow:**
1. Read `req.user.impersonation` from token payload.
2. Require active session and matching `sessionId`.
3. Load actor user and roles.
4. Sign access token as actor.
5. Return `{ tokens: { accessToken }, user: actorUserSummary, portalAccess: actorPortalAccess, impersonationEnded: true }`.

### Task 5: Add audit logging for start/stop

**Objective:** Preserve traceability for a privileged feature.

**Files:**
- Inspect existing audit services/models first.
- Modify whichever existing audit service is canonical; if none is available, add minimal service under `backend/src/apps/store-api/services/impersonation-audit.service.ts`.

**Events:**
- `IMPERSONATION_STARTED`
- `IMPERSONATION_ENDED`

**Metadata:**
- actor user id/name/roles
- target user id/name/role
- session id
- started/ended timestamps
- duration seconds on stop

### Task 6: Add controller endpoints and routes

**Objective:** Expose the feature under v2 auth API.

**Files:**
- Modify: `backend/src/apps/store-api/controllers/auth.controller.ts`
- Modify: `backend/src/apps/store-api/routes/v2/auth.routes.ts`

**Endpoints:**
- `POST /api/v2/auth/impersonation/start`
- `POST /api/v2/auth/impersonation/stop`

**Security:**
- Both require auth middleware.
- Start must reject non-Admin even if the frontend hides the button.

### Task 7: Make refresh/logout impersonation-safe

**Objective:** Prevent refresh/logout from corrupting the actor session.

**Files:**
- Modify: `backend/src/apps/store-api/services/auth.service.ts`
- Modify: `frontend/src/api/axios.js`
- Modify: `frontend/src/lib/authUtils.js`

**Preferred v1 behavior:**
- `performLocalLogout()` must clear impersonation storage too.
- Axios refresh should detect active impersonation and avoid silently refreshing into a wrong identity. Recommended: call stop impersonation before long expiry, or if refresh fails/401 happens, clear impersonation and send user to login rather than pretending to still be target.
- If backend refresh receives actor refresh token while access token is impersonated, document/verify that returned tokens restore actor, not target.

### Task 8: Add frontend impersonation session utility

**Objective:** Keep local impersonation state in one place.

**Files:**
- Create: `frontend/src/lib/impersonation.js`
- Modify: `frontend/src/lib/authUtils.js`

**Exports:**
- `getImpersonationSession()`
- `setImpersonationSession(session)`
- `clearImpersonationSession()`
- `isImpersonating()`
- `emitImpersonationChange()`

**Storage key:** `kalima.impersonationSession`.

### Task 9: Add frontend API calls

**Objective:** Start/stop from the UI and update auth state.

**Files:**
- Create: `frontend/src/api/impersonation.js`
- Possibly modify: `frontend/src/contexts/AuthContext.jsx` to expose `replaceSession(user, tokens, portalAccess)`.

**Functions:**
- `startImpersonation({ targetUserId, targetRole })`
- `stopImpersonation({ sessionId })`

**On start:**
- Store returned access token.
- Store returned `user` and `portalAccess` for the target.
- Store impersonation session metadata.
- Dispatch auth/impersonation change event.

**On stop:**
- Store returned actor access token/user/portalAccess.
- Clear impersonation session.
- Navigate back to `/admin/dashboard`.

### Task 10: Build admin sidebar entry and modal/page

**Objective:** Let Admin choose any non-admin target from the sidebar.

**Files:**
- Modify: `frontend/src/components/admin/Sidebar.jsx`
- Create: `frontend/src/pages/admin/impersonation/ImpersonationPage.jsx` OR create modal component `frontend/src/components/admin/impersonation/ImpersonationDialog.jsx`
- Modify: `frontend/src/App.jsx` if using a page route.

**Recommended UI:**
- Add sidebar item “Impersonate” for Admin and SubAdmin users.
- Use a dedicated `/admin/impersonation` page if sidebar space is tight; use modal only if it fits cleanly.
- Page/dialog lists all users with search; optional role filters can include every role.
- Reuse existing `/admin/users` API with role filter/search if available; otherwise add a small backend target-list endpoint.
- Each row: name, email/phone if available, role, “Impersonate” button.

### Task 11: Add global impersonation banner and exit action

**Objective:** Make impersonation impossible to miss and easy to stop.

**Files:**
- Create: `frontend/src/components/impersonation/ImpersonationBanner.jsx`
- Modify: `frontend/src/App.jsx` or top-level layouts to render it globally.

**Banner content:**
- “You are viewing as [targetName] ([targetRole]). Original admin: [actorName].”
- Button: “Exit impersonation”.
- On click: call stop endpoint, restore admin session, navigate `/admin/dashboard`.

### Task 12: Route and role behavior validation

**Objective:** Ensure impersonated roles see their own portal, not admin pages.

**Files:**
- Modify if needed: `frontend/src/hooks/useRole.js`
- Modify if needed: `frontend/src/components/RoleRoute.jsx`
- Modify if needed: `frontend/src/contexts/AuthContext.jsx`

**Checks:**
- After impersonating Teacher, route to `/teacher/profile` or `/teacher/e-booklets` depending desired landing.
- After impersonating Student, route to `/student/e-booklets`.
- After impersonating any role, route to that role’s safest existing landing page. If a role has no dashboard, route to the safest allowed page and show a clear empty state.
- Admin routes should no longer pass while impersonating if local `portalAccess` has target roles only.

### Task 13: Add backend tests

**Objective:** Prove security invariants.

**Files:**
- Add/modify backend Jest tests under existing auth/admin test locations.

**Cases:**
- Admin can start impersonation as Teacher.
- Admin can start impersonation as Student.
- Admin can start impersonation as Parent/Lecturer/Moderator/Assistant as well as Teacher/Student.
- SubAdmin cannot start impersonation.
- Non-admin users cannot start impersonation.
- Admin cannot impersonate Admin/SubAdmin.
- Role mismatch is rejected.
- Nested impersonation rejected.
- Stop restores Admin token.
- Start/stop audit rows are written.

Run: `cd backend && npm test -- --runInBand`.

### Task 14: Add frontend verification

**Objective:** Prove the UI wiring works.

**Files:**
- Existing frontend has no test script beyond build/lint, so validate by build and manual smoke.

**Commands:**
- `cd frontend && npm run build`
- `cd backend && npm run build`

**Manual smoke:**
1. Login as Admin.
2. Confirm sidebar shows “Impersonate”.
3. Login as SubAdmin and confirm sidebar does not show it.
4. As Admin, open impersonation, search/select Teacher.
5. Confirm banner appears and Teacher routes/data are active.
6. Exit impersonation and confirm Admin dashboard/session returns.
7. Repeat for Student, Parent, Lecturer, Moderator, and Assistant where seeded accounts exist.
8. Direct-call start endpoint as non-admin and confirm 403.

---

## Open confirmations before implementation

1. Should `SubAdmin` remain blocked as planned, or should `SubAdmin` also be allowed to initiate impersonation?
2. What should each non-admin role’s landing route be if that role has no dedicated dashboard?

## Recommended first execution slice

Implement backend start/stop + tests first, then frontend session utility/API, then sidebar/page/banner. Do not start with UI only; the security model must be backend-owned.
