# Kalima E-Booklet Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Kalima's standalone E-Booklet module with separate product, purchase, delivery, invite, viewer, and no-download access-control flows.

**Architecture:** E-booklets are separate from normal Market products. Templates and versioned hotspot data live on reusable admin-created records; teacher instances carry teacher-specific documents, branding, quota, invites, and student access. Viewer endpoints must authorize each page/hotspot request and avoid exposing full document URLs.

**Tech Stack:** Backend: Express + TypeScript + Prisma/PostgreSQL + Jest. Frontend: React/Vite + React Router + existing auth/role guards + existing shadcn/Radix/lucide component patterns. Browser verification: use the requested browser harness when available; otherwise use Playwright against the local Vite/backend servers.

**Final status, 2026-05-06:** MVP module slices 1-6 were implemented on branch `codex/e-booklet-module` and verified with backend Jest tests, backend/frontend builds, and browser QA passes for store checkout, admin template editing, teacher delivery/viewer, student invite access, and final viewer hardening. Production-readiness gaps are tracked in `reports/e-booklet-launch-scale-readiness.md`.

---

## Requirement Coverage Todo

### Phase 1: Backend Foundation
- [ ] Add Prisma enums and tables for `e_booklet_templates`, `e_booklet_template_versions`, `e_booklet_hotspots`, `e_booklet_purchases`, `e_booklet_instances`, `e_booklet_access`, `e_booklet_invites`, `e_booklet_invite_redemptions`, `e_booklet_file_assets`, and `e_booklet_audit_logs`.
- [ ] Add indexes for store listings, purchase status, instance owner, access checks, active invites, hashed tokens, and viewer page access.
- [ ] Generate Prisma client and keep generated type files in sync with schema.
- [ ] Add e-booklet DTOs for admin template creation, template updates, hotspot writes, checkout requests, purchase status transitions, delivery, quota updates, invite creation, invite acceptance, and viewer requests.
- [ ] Add upload middleware for e-booklet documents, covers, and hotspot media with PDF/DOC/DOCX/image/video/audio MIME allowlists.
- [ ] Add file asset service that stores private files under backend-controlled private directories and records metadata in `e_booklet_file_assets`.
- [ ] Add document service stubs for PDF page-count/dimension validation and DOC/DOCX normalization hooks; implement PDF metadata validation first and leave conversion behind an explicit method.
- [ ] Add e-booklet service methods for template CRUD, version locking, hotspot CRUD, purchase request creation, delivery, instance access, invites, invite acceptance, viewer metadata/pages/hotspots/content, and audit logging.
- [ ] Add separate `/api/v2/e-booklet-*` and `/api/v2/admin/e-booklet-*` routes without touching product/cart/purchase routes.
- [ ] Add backend Jest tests for version locking, page-count validation, quota enforcement, transactional invite acceptance, access revocation, and viewer authorization.

### Phase 2: Admin Template Creation
- [ ] Add admin sidebar item and routes for templates, create wizard, edit template, purchases, instances, and preview.
- [ ] Add `useAdminEBooklets` hook for admin API calls.
- [ ] Build admin template list with status, page count, purchase count, search/filter, and actions.
- [ ] Build create-template wizard: basic info, original file upload, hotspot editor, review/publish.
- [ ] Build hotspot editor supporting page navigation, add/drag/resize/delete/duplicate hotspots, text/image/video/audio payloads, preview mode, and page-level hotspot list.
- [ ] Build admin purchase management: status filters, teacher/template/payment/branding details, mark-paid, upload teacher document, set quota, deliver.
- [ ] Build teacher instance management: list, quota edits, student access, revoke, replace document, logs.
- [ ] Browser-review every admin page after the route is reachable.

### Phase 3: Store and Purchase
- [ ] Add public `/e-booklets` store page separate from `/market`.
- [ ] Add `/e-booklets/:slug` details page with price, page count, preview terms, and no-download/invite rules.
- [ ] Add e-booklet cart state separate from normal cart and fixed quantity of 1 per template.
- [ ] Add e-booklet checkout page that submits teacher branding/contact notes and creates an e-booklet purchase request.
- [ ] Update main navigation to show Samples, Market, and E-Booklets.
- [ ] Browser-review desktop and mobile store/details/cart/checkout flows.

### Phase 4: Delivery and Teacher Viewer
- [ ] Add Teacher My E-Booklets page showing pending, in-progress, ready, and suspended states.
- [ ] Add Teacher E-Booklet Viewer with page-by-page rendering, hotspot overlays, media dialogs, zoom, fullscreen affordance, watermark, no download/print controls, and invite-management entry point.
- [ ] Add teacher invite management with quota, active link creation, copy, disable, student list, and revoke.
- [ ] Browser-review teacher pages and viewer interaction.

### Phase 5: Student Access
- [ ] Add invite accept page that redirects logged-out users through login/register and validates token after login.
- [ ] Add Student My E-Booklets page with teacher name, display title, and open action.
- [ ] Add Student E-Booklet Viewer without teacher controls.
- [ ] Browser-review student invite acceptance, tab listing, and viewer interaction.

### Phase 6: Security, Scale, and Operations
- [ ] Replace any app-local private-file assumptions with deployment-safe storage abstraction or document the remaining local-storage risk.
- [ ] Ensure no viewer endpoint returns permanent document or media URLs.
- [ ] Ensure full PDFs are not served publicly; page endpoints serve only authorized page render payloads.
- [ ] Add watermarks for teacher and student views.
- [ ] Add access logs for teacher/student opens, page views, invite creation, invite redemption, revocation, admin delivery, file replacement, and failed invite attempts.
- [ ] Add rate limiting to invite acceptance and page/media endpoints if the current server rate limiter is not applied globally.
- [ ] Add launch-scale-readiness review after MVP completion and fix P0/P1 findings.

---

## Task 1: Backend Schema and Foundation Service Tests

**Files:**
- Modify: `kalima-platform/backend/src/apps/store-api/prisma/schema.prisma`
- Create: `kalima-platform/backend/src/apps/store-api/prisma/migrations/20260506130000_e_booklet_foundation/migration.sql`
- Create: `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`
- Create: `kalima-platform/backend/src/apps/store-api/dtos/e-booklet.dto.ts`
- Create: `kalima-platform/backend/src/apps/store-api/middleware/e-booklet-upload.middleware.ts`
- Create: `kalima-platform/backend/src/apps/store-api/utils/e-booklet-token.ts`
- Create: `kalima-platform/backend/tests/e-booklet/e-booklet.service.spec.ts`

- [ ] **Step 1: Write failing backend service tests**

Create tests that instantiate `EBookletService` with a mocked Prisma-like client. Cover:
- `validateTeacherDocumentForDelivery` blocks mismatched page counts.
- `acceptInvite` creates access and redemption in a transaction only when quota remains.
- `acceptInvite` redirects existing active access without consuming quota.
- `revokeTeacherAccess` revokes active student access for that instance.

Run:
```powershell
cd kalima-platform/backend
npm test -- --runTestsByPath tests/e-booklet/e-booklet.service.spec.ts --runInBand
```
Expected: FAIL because `e-booklet.service.ts` does not exist yet.

- [ ] **Step 2: Add Prisma schema and migration**

Add e-booklet enums and relation fields to `users`, `categories`, and the new e-booklet models. Migration must create tables, enums, foreign keys, unique constraints, and access-path indexes. Use integer IDs to match the existing store schema.

Run:
```powershell
cd kalima-platform/backend
npx prisma generate --schema src/apps/store-api/prisma/schema.prisma
```
Expected: Prisma client generation succeeds and generated files include the new e-booklet models/enums.

- [ ] **Step 3: Implement minimal service code**

Implement only the service behaviors exercised by the tests:
- document page-count validation against the locked template version
- active student access count quota checks inside a transaction
- hashed invite token lookup
- existing active access idempotency
- teacher revocation cascading to students

Run the same targeted Jest command. Expected: PASS.

- [ ] **Step 4: Build backend**

Run:
```powershell
cd kalima-platform/backend
npm run build
```
Expected: TypeScript build exits 0.

---

## Task 2: Backend API Namespace

**Files:**
- Create: `kalima-platform/backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- Create: `kalima-platform/backend/src/apps/store-api/routes/v2/e-booklet.routes.ts`
- Modify: `kalima-platform/backend/src/apps/store-api/routes/v2/index.ts`
- Test: `kalima-platform/backend/tests/e-booklet/e-booklet.routes.spec.ts`

- [ ] **Step 1: Write failing route tests**
- [ ] **Step 2: Add admin/store/teacher/student/viewer route groups**
- [ ] **Step 3: Wire route groups into `/api/v2`**
- [ ] **Step 4: Verify route auth and role middleware behavior**
- [ ] **Step 5: Run targeted route tests and backend build**

## Task 3: Frontend Navigation and E-Booklet Store Shell

**Files:**
- Modify: `kalima-platform/frontend/src/App.jsx`
- Modify: `kalima-platform/frontend/src/layouts/Navbar.jsx`
- Modify: `kalima-platform/frontend/src/layouts/Footer.jsx`
- Create: `kalima-platform/frontend/src/hooks/useEBooklets.js`
- Create: `kalima-platform/frontend/src/pages/e-booklets/EBookletStorePage.jsx`
- Create: `kalima-platform/frontend/src/pages/e-booklets/EBookletDetailsPage.jsx`
- Create: `kalima-platform/frontend/src/pages/e-booklets/EBookletCheckoutPage.jsx`

- [ ] **Step 1: Add routes and navigation without reusing `/market` product hooks**
- [ ] **Step 2: Build store/details/checkout shells against e-booklet APIs**
- [ ] **Step 3: Run frontend build**
- [ ] **Step 4: Start local frontend/backend and browser-review desktop/mobile navigation**

## Task 4: Admin E-Booklet Management Shell

**Files:**
- Modify: `kalima-platform/frontend/src/App.jsx`
- Modify: `kalima-platform/frontend/src/components/admin/Sidebar.jsx`
- Create: `kalima-platform/frontend/src/hooks/admin/useAdminEBooklets.js`
- Create: `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletTemplatesPage.jsx`
- Create: `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletCreatePage.jsx`
- Create: `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletPurchasesPage.jsx`
- Create: `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletInstancesPage.jsx`

- [ ] **Step 1: Add admin routes and sidebar entry**
- [ ] **Step 2: Build templates list/create wizard/purchases/instances MVP screens**
- [ ] **Step 3: Browser-review admin route rendering**

## Task 5: Teacher and Student E-Booklet Shells

**Files:**
- Modify: `kalima-platform/frontend/src/App.jsx`
- Modify: `kalima-platform/frontend/src/components/teacher/TeacherSidebar.jsx`
- Modify: `kalima-platform/frontend/src/components/student/StudentSidebar.jsx`
- Create: `kalima-platform/frontend/src/pages/teacher/e-booklets/TeacherEBookletsPage.jsx`
- Create: `kalima-platform/frontend/src/pages/teacher/e-booklets/TeacherEBookletViewerPage.jsx`
- Create: `kalima-platform/frontend/src/pages/teacher/e-booklets/TeacherEBookletInvitesPage.jsx`
- Create: `kalima-platform/frontend/src/pages/student/e-booklets/StudentEBookletsPage.jsx`
- Create: `kalima-platform/frontend/src/pages/student/e-booklets/StudentEBookletViewerPage.jsx`
- Create: `kalima-platform/frontend/src/pages/e-booklets/AcceptEBookletInvitePage.jsx`

- [ ] **Step 1: Add role-specific routes and sidebars**
- [ ] **Step 2: Build reusable viewer shell with no download/print UI and watermark**
- [ ] **Step 3: Build invite management and invite acceptance pages**
- [ ] **Step 4: Browser-review teacher and student flows**

## Task 6: Security and Launch Readiness Review

**Files:**
- Modify service/routes/pages as review findings require.
- Create: `kalima-platform/reports/e-booklet-launch-scale-readiness.md`

- [ ] **Step 1: Run launch-scale-readiness review against the finished e-booklet module**
- [ ] **Step 2: Fix all P0/P1 findings**
- [ ] **Step 3: Run backend tests, backend build, frontend build, and browser review**
- [ ] **Step 4: Record final coverage matrix and residual risks**
