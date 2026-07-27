# Admin Analytics Access Implementation Plan
> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-dev (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `/admin/analytics` and its data endpoints accessible only to users with the exact `Admin` role.

**Architecture:** A shared frontend access predicate will drive both route guarding and sidebar visibility. A dedicated backend middleware will protect every endpoint consumed by the main analytics page. Existing e-booklet analytics routes remain unchanged.

**Tech Stack:** React 19, React Router, Node test runner, Express, TypeScript, Jest.

## Global Constraints

- Restrict only `/admin/analytics`.
- Do not change `/admin/e-booklets/analytics` or `/teacher/e-booklet-analytics`.
- Preserve the current analytics page UI and data calculations.
- Use the existing unauthorized redirect and forbidden-response behavior.

## File Structure

- Create `kalima-platform/frontend/src/lib/adminAnalyticsAccess.js` for the exact frontend role predicate.
- Create `kalima-platform/frontend/src/lib/adminAnalyticsAccess.test.mjs` for role matrix regression tests.
- Modify `kalima-platform/frontend/src/App.jsx` to add an Admin-only nested route guard.
- Modify `kalima-platform/frontend/src/components/admin/Sidebar.jsx` to hide the navigation item from non-admin roles.
- Create `kalima-platform/backend/src/apps/store-api/middleware/adminAnalyticsAuth.ts` for reusable Admin-only analytics middleware.
- Create `kalima-platform/backend/src/apps/store-api/middleware/adminAnalyticsAuth.spec.ts` for authorization tests.
- Modify `kalima-platform/backend/src/apps/store-api/routes/v2/admin-dashboard.routes.ts` to apply the middleware to analytics endpoints.

### Task 1: Frontend access contract

- [x] Create a failing Node test proving `canAccessAdminAnalytics(["Admin"])` is true and SubAdmin, Moderator, Assistant, Teacher, and empty roles are false.
- [x] Run `node --test src/lib/adminAnalyticsAccess.test.mjs` from `kalima-platform/frontend` and confirm failure because the module does not exist.
- [x] Create `adminAnalyticsAccess.js` with `ADMIN_ANALYTICS_ALLOWED_ROLES = ["Admin"]` and a predicate that checks the supplied role list.
- [x] Run the focused Node test and confirm it passes.

### Task 2: Frontend route and navigation restriction

- [x] Import `ADMIN_ANALYTICS_ALLOWED_ROLES` into `App.jsx`.
- [x] Wrap only `/admin/analytics` in a nested `RoleRoute` using `requiredRole={ADMIN_ANALYTICS_ALLOWED_ROLES}`.
- [x] Import `canAccessAdminAnalytics` into `Sidebar.jsx`.
- [x] Mark the analytics navigation entry with `adminOnly: true`.
- [x] Extend the navigation filter so `adminOnly` entries require `canAccessAdminAnalytics(storeRoles)`.
- [x] Run the focused frontend access test and `npm run build`.

### Task 3: Backend analytics authorization

- [x] Create a failing Jest test proving the analytics role guard allows Admin and rejects SubAdmin, Moderator, and Assistant with status 403.
- [x] Run `npm test -- --runInBand src/apps/store-api/middleware/adminAnalyticsAuth.spec.ts` from `kalima-platform/backend` and confirm failure because the middleware does not exist.
- [x] Create `adminAnalyticsAuth.ts` using `authenticateToken` and `requireRole([role_enum.Admin])`.
- [x] Replace the broad Admin/SubAdmin/Moderator middleware on `store-stats`, `product-performance`, `response-time`, and `user-stats` with the dedicated analytics middleware.
- [x] Leave `confirmer-stats` and `staff-report` unchanged because they belong to Employee Performance rather than `/admin/analytics`.
- [x] Run the focused Jest test and `npm run build`.

### Task 4: End-to-end verification

- [x] Start the existing Kalima local development stack.
- [x] Sign in as Admin in the built-in browser and confirm the Analytics sidebar item is visible and `/admin/analytics` loads.
- [x] Sign in as a non-admin admin-portal user and confirm the Analytics sidebar item is absent.
- [x] Enter `/admin/analytics` directly as that non-admin user and confirm the existing unauthorized redirect occurs.
- [x] Capture a proof screenshot showing the completed visible restriction.
