# Admin-Only Employee Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-dev (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Employee Performance visible and accessible only to users with the `Admin` role.

**Architecture:** Define an explicit frontend access policy consumed by both navigation and route guarding, then apply a dedicated admin-only middleware chain to the backend staff report endpoint. Keep every other admin dashboard permission unchanged.

**Tech Stack:** React 19, React Router 7, Node test runner, Express 4, TypeScript, Jest.

## Global Constraints

- `Admin` is the only allowed role.
- `SubAdmin`, `Moderator`, and every other role must be denied.
- Existing unauthorized-route behavior remains unchanged.
- Only Employee Performance navigation, route access, and staff report authorization are in scope.

### Task 1: Frontend Employee Performance Access Policy

- Create: `kalima-platform/frontend/src/lib/employeePerformanceAccess.js`
- Create: `kalima-platform/frontend/src/lib/employeePerformanceAccess.test.mjs`
- Modify: `kalima-platform/frontend/src/components/admin/Sidebar.jsx`
- Modify: `kalima-platform/frontend/src/App.jsx`
- Produces: `EMPLOYEE_PERFORMANCE_ALLOWED_ROLES: string[]` and `canAccessEmployeePerformance(roles: string[]): boolean`

- [ ] **Step 1: Write the failing policy test**

Test literal role fixtures so `Admin` returns `true`, while `SubAdmin`, `Moderator`, and an empty role list return `false`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/employeePerformanceAccess.test.mjs`

Expected: FAIL because `employeePerformanceAccess.js` does not exist.

- [ ] **Step 3: Implement and consume the minimal policy**

Export `EMPLOYEE_PERFORMANCE_ALLOWED_ROLES = ['Admin']`.
Export `canAccessEmployeePerformance(roles)` using `.some(...)`.
Filter the sidebar item with this function.
Wrap only `/admin/employee-performance` in a nested `RoleRoute` using the exported roles.

- [ ] **Step 4: Run the focused test**

Run: `node --test src/lib/employeePerformanceAccess.test.mjs`

Expected: PASS with four role cases.

### Task 2: Backend Staff Report Authorization

- Create: `kalima-platform/backend/src/apps/store-api/middleware/employeePerformanceAuth.spec.ts`
- Modify: `kalima-platform/backend/src/apps/store-api/routes/v2/admin-dashboard.routes.ts`
- Consumes: `requireRole(allowedRoles: role_enum[])`
- Produces: `employeePerformanceAuth` middleware chain limited to `role_enum.Admin`

- [ ] **Step 1: Write the failing middleware behavior test**

Exercise the exported staff-report authorization middleware with request fixtures.
Verify an Admin request reaches `next()` without an error.
Verify SubAdmin and Moderator requests pass a forbidden error to `next`.

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- --runInBand src/apps/store-api/middleware/employeePerformanceAuth.spec.ts`

Expected: FAIL because the dedicated middleware export does not exist.

- [ ] **Step 3: Implement the dedicated middleware chain**

Add `employeePerformanceAuth = [authenticateToken, requireRole([role_enum.Admin])]`.
Apply it only to `GET /staff-report`.
Leave `adminAuth` unchanged for all other analytics endpoints.

- [ ] **Step 4: Run the focused backend test**

Run: `npm test -- --runInBand src/apps/store-api/middleware/employeePerformanceAuth.spec.ts`

Expected: PASS for Admin and denial cases.

### Task 3: Verification and UI Proof

- [ ] **Step 1: Run frontend build**

Run: `npm run build`

Expected: Vite build exits successfully.

- [ ] **Step 2: Run backend build**

Run: `npm run build`

Expected: TypeScript compilation exits successfully.

- [ ] **Step 3: Run focused frontend and backend tests again**

Run both focused commands from Tasks 1 and 2.

Expected: All focused tests pass with no failures.

- [ ] **Step 4: Verify in the built-in Browser**

Open the local application as Admin and SubAdmin.
Capture proof that Admin sees Employee Performance.
Capture proof that SubAdmin does not see it and cannot open the direct route.
