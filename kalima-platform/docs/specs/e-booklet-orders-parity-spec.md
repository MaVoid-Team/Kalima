# E-Booklet Orders Parity Spec

## Goal

Upgrade the teacher-facing e-booklet orders page at `/e-booklet-orders` so it has feature and UX parity with the existing product orders page at `/teacher/orders`, while keeping the admin e-booklet purchases workflow synchronized with the same status language, lifecycle, and delivery state.

The end result should make e-booklet orders feel like first-class product orders: teachers can filter by status, review polished order cards, open order details, expand ordered e-booklet items, track/contact support about an order, and access management actions when the e-booklet is ready or delivered.

## Scope

In scope:

- Teacher page: `/e-booklet-orders`.
- Admin e-booklet purchases list: `/admin/e-booklets/orders`.
- Admin e-booklet purchase delivery page: `/admin/e-booklets/orders/:purchaseId/delivery`.
- Shared frontend e-booklet order status contract.
- E-booklet order translations and status copy.
- Frontend hook behavior for filters, pagination, and refresh.
- Backend contract verification for existing e-booklet order and admin purchase endpoints.

Out of scope:

- Replacing normal product orders.
- Merging e-booklet purchase tables with normal product purchase tables.
- Redesigning `/teacher/e-booklets` library/dashboard.
- Changing checkout/payment proof collection unless a missing display field requires exposing existing data.
- Real-time websocket updates between admin and teacher pages.

## Existing Reference UI

The target visual and interaction reference is the normal teacher orders page.

Reference files:

- `kalima-platform/frontend/src/pages/orders/MyOrdersPage.jsx`
- `kalima-platform/frontend/src/components/orders/OrderCard.jsx`
- `kalima-platform/frontend/src/components/orders/OrdersStatusFilter.jsx`
- `kalima-platform/frontend/src/components/orders/OrdersListState.jsx`
- `kalima-platform/frontend/src/components/orders/OrderDetailsDialog.jsx`
- `kalima-platform/frontend/src/components/orders/OrderItemsCollapsible.jsx`
- `kalima-platform/frontend/src/hooks/useOrders.js`

Important reference behavior:

- Page uses a centered `max-w-5xl` container with header and status filter row.
- Orders render as stacked rounded cards, not a dense table.
- Cards have `rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-md hover:border-border/80 group`.
- Each card shows reference, status badge, date, total, `View details`, and `Track Your Order`.
- Items are hidden behind an expand/collapse control.
- Empty states are contextual to active filters.
- Pagination uses shared pagination primitives.

## Existing E-Booklet Order Context

Current teacher e-booklet orders page:

- `kalima-platform/frontend/src/pages/e-booklets/EBookletOrdersPage.jsx`

Current e-booklet order hook:

- `kalima-platform/frontend/src/hooks/useEBooklets.js`
- `useEBookletOrders()` currently fetches `/e-booklet-orders`, stores `orders`, `pagination`, `loading`, and `error`.

Current shared route/status contract:

- `kalima-platform/frontend/src/pages/e-booklets/eBookletOrdersContract.mjs`

Current admin e-booklet purchase UI:

- `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletPurchasesPage.jsx`
- `kalima-platform/frontend/src/pages/admin/e-booklets/AdminEBookletPurchaseDeliveryPage.jsx`

Current backend routes:

- `GET /e-booklet-orders`
- `GET /admin/e-booklet-purchases`
- `GET /admin/e-booklet-purchases/:id`
- `PATCH /admin/e-booklet-purchases/:id/status`
- `POST /admin/e-booklet-purchases/:id/mark-paid`
- `POST /admin/e-booklet-purchases/:id/deliver`

Current backend service areas:

- `kalima-platform/backend/src/apps/store-api/controllers/e-booklet.controller.ts`
- `kalima-platform/backend/src/apps/store-api/services/e-booklet.service.ts`

## Product Decisions

### Page Target

The requested page is `/e-booklet-orders`, not `/teacher/e-booklets`.

`/teacher/e-booklets` remains the teacher's delivered e-booklet library and management area. `/e-booklet-orders` becomes the order history and tracking surface.

### E-Booklets As Products

E-booklets should be treated as product-like purchases in the user experience. This means order cards, tracking, details, filtering, status explanations, and item expansion should mirror normal product orders.

E-booklets should not be forced into the normal product purchase database model in this scope. This project reuses UI patterns and shared status semantics, not database tables.

### Tracking CTA

Use the same general idea as normal orders: a support/tracking button on each active e-booklet order.

Default label: `Track Your Order`.

Acceptable fallback label if the team wants clearer digital-product wording: `Contact Support`.

The CTA should not appear for terminal negative states if it creates confusion. It may still appear for rejected/cancelled orders if support follow-up is useful, but that should be a deliberate choice.

### Details Dialog

Teacher users should be able to open a details dialog from every e-booklet order card.

The dialog should show the best available information from the e-booklet purchase payload without assuming it matches normal product purchases exactly.

### Admin Sync

Admin status changes and delivery actions must immediately be visible to the teacher on page reload. Admin and teacher pages must use the same status labels and compatible status filters.

## Status Model

### Canonical Status List

Use one shared frontend status list for e-booklet orders and admin e-booklet purchases.

Canonical statuses:

- `pending`
- `awaiting_payment`
- `paid`
- `needs_branding_info`
- `customization_in_progress`
- `ready`
- `delivered`
- `rejected`
- `cancelled`
- `unknown`

Important gap to fix:

- `delivered` is currently used by the admin flow and backend delivery flow, but is missing from `E_BOOKLET_ORDER_STATUSES` in `eBookletOrdersContract.mjs`.

### Status Filter Behavior

Both teacher and admin status filters need an `all` option.

`all` is a UI-only value. It must not be sent to the backend as `status=all`.

When status is `all`:

- Omit `status` from request params.
- Reset pagination to page `1` when changing to or from `all`.
- Empty-state copy should say no e-booklet orders exist, not no orders with status `all`.

When status is any canonical status:

- Send that status to the backend.
- Reset pagination to page `1` when status changes.
- Empty-state copy should mention that no orders match the selected status.

### Status Transitions

Expected conceptual lifecycle:

- `pending` or `awaiting_payment`: order submitted, waiting for payment/admin processing.
- `paid`: payment approved or recorded.
- `needs_branding_info`: admin needs more information before customization/delivery.
- `customization_in_progress`: admin is preparing the e-booklet or teacher-specific document/version.
- `ready`: e-booklet is ready for teacher management or access setup.
- `delivered`: e-booklet delivery is complete and should be accessible/manageable.
- `rejected`: admin rejected the request.
- `cancelled`: order was cancelled.
- `unknown`: defensive fallback for unexpected values.

Implementation note:

- If the backend `mark-paid` flow currently jumps directly to `ready`, document this in UI copy and keep action labels accurate. Do not imply there is a separate `paid` phase if the system does not persist it.

## Teacher-Facing Requirements

### Layout

Update `EBookletOrdersPage.jsx` to follow the same structure as `MyOrdersPage.jsx`.

Expected layout:

- Centered max-width page container.
- Header with title, subtitle, and e-booklet context.
- Right-aligned or responsive status filter control.
- Loading state.
- Empty state.
- Stacked order card list.
- Pagination footer when more than one page exists.

Recommended container classes:

- `container py-10 max-w-5xl mx-auto space-y-8 animate-fade-in px-4 md:px-6`

### Status Filter

Use the normal orders segmented filter pattern where possible.

Options:

- Reuse `OrdersStatusFilter.jsx` directly if the `data-testid` naming is acceptable.
- Or create an e-booklet-specific thin wrapper that keeps the same visual classes but uses e-booklet-specific test IDs.

Expected options:

- `All Orders`
- `Pending`
- `Awaiting Payment`
- `Paid`
- `Needs Branding Info`
- `Customization In Progress`
- `Ready`
- `Delivered`
- `Rejected`
- `Cancelled`

`unknown` should not usually appear as a filter unless there is real data in that state. It should remain a display fallback.

### Order Cards

Create an e-booklet-specific card component rather than forcing normal `OrderCard` to accept two unrelated payload shapes.

Recommended component:

- `kalima-platform/frontend/src/components/e-booklets/EBookletOrderCard.jsx`

Card behavior:

- Uses the same rounded border/hover shell as `OrderCard`.
- Shows e-booklet order reference.
- Shows status badge with icon and translated label.
- Shows submitted/created date.
- Shows total/price when present.
- Shows `View details` button.
- Shows tracking/contact CTA when appropriate.
- Shows `Manage Access` or `Open Library` when status and data allow it.
- Contains expandable e-booklet item/details section.

Reference resolution:

- Prefer `purchase_serial`.
- Then `serial`.
- Then `reference`.
- Fallback to `#${id}`.

Title resolution:

- Prefer instance `display_title`.
- Then instance template title.
- Then purchase template title.
- Then translated fallback: `E-Booklet`.

### Teacher Action Mapping

Per-status teacher card actions:

- `pending`: `View details`, `Track Your Order`.
- `awaiting_payment`: `View details`, `Track Your Order`.
- `paid`: `View details`, `Track Your Order`.
- `needs_branding_info`: `View details`, `Track Your Order`; optionally highlight admin note if available.
- `customization_in_progress`: `View details`, `Track Your Order`.
- `ready`: `View details`, `Track Your Order`, `Manage Access` when instance ID exists.
- `delivered`: `View details`, `Manage Access` when instance ID exists, optional `Open Library`.
- `rejected`: `View details`; show reason/admin note when available.
- `cancelled`: `View details`; hide management actions.
- `unknown`: `View details`, defensive status copy.

Manage path resolution:

- If there is an instance ID: `/teacher/e-booklets/:instanceId/invites`.
- If no instance ID but the order is ready/delivered: fallback to `/teacher/e-booklets`.

### Details Dialog

Recommended component:

- `kalima-platform/frontend/src/components/e-booklets/EBookletOrderDetailsDialog.jsx`

Required sections:

- Summary: reference, status, submitted date, total/price, currency.
- E-booklet: template title, instance title, version, page count if available.
- Payment: payment status, payment method if available, payment screenshot if available, transferred-from number if available.
- Delivery/access: status, expiry, instance ID, invite quota if available, access/manage link if ready or delivered.
- Admin message: admin notes, rejection reason, cancellation reason, or missing-info reason if available.

Defensive behavior:

- Do not crash when fields are absent.
- Use `-` or translated fallback for missing values.
- Do not show empty image placeholders for missing payment screenshots.

### Expandable Items

Recommended component:

- `kalima-platform/frontend/src/components/e-booklets/EBookletOrderItemsCollapsible.jsx`

Behavior:

- Mirrors `OrderItemsCollapsible.jsx` expand/collapse pattern.
- Shows each linked e-booklet/template/instance.
- Shows item status.
- Shows template or instance title.
- Shows version/page count when available.
- Shows `Manage Access` for item-level ready/delivered states when instance ID exists.

Link extraction should support:

- `order.instances`
- `order.e_booklet_student_purchase_links`
- fallback single pseudo-item based on purchase/template data

### Loading, Empty, Error States

Loading:

- Use existing loading spinner or a compact loading row matching normal orders.

Empty:

- No orders: tell teacher they have not placed e-booklet orders yet and offer browse store CTA.
- Filtered empty: tell teacher there are no e-booklet orders with this status.

Error:

- Show a bordered destructive/alert message.
- Include retry by refetching if practical.

### Pagination

Use shared pagination primitives from:

- `kalima-platform/frontend/src/components/ui/pagination`

Backend currently returns:

- `total`
- `page`
- `limit`

Teacher hook must calculate:

- `pages = Math.max(1, Math.ceil(total / limit))`

Pagination behavior:

- Disable previous at page `1`.
- Disable next at last page.
- Use `generatePaginationLinks` like normal orders.
- Keep current filters when page changes.

## Admin-Facing Requirements

### Shared Status Contract

Replace local admin-only `purchaseStatuses` drift with the shared e-booklet order status contract.

Current issue:

- `AdminEBookletPurchasesPage.jsx` defines its own statuses, including `delivered`.
- `eBookletOrdersContract.mjs` defines teacher statuses but omits `delivered`.

Required behavior:

- Admin and teacher import the same canonical status list.
- Admin may add `all` as a UI option locally, but canonical statuses should come from the contract.

### Admin Purchases List

Update `AdminEBookletPurchasesPage.jsx` to make teacher/admin sync obvious.

Required fields in the list/table:

- Purchase reference/serial or `#id`.
- Teacher name/email.
- Template/e-booklet title.
- Status with same translated label used on teacher page.
- Price/currency.
- Version/page count where available.
- Delivery/access state: instance exists, teacher access granted, delivered status.
- Actions.

Recommended action labels:

- `Approve Payment` for payment approval.
- `Prepare Delivery` when customization/setup is needed.
- `Deliver` when ready for delivery.
- `View Delivery` for delivered or already opened delivery records.

Current action issue:

- Admin action text `Approve / unlock` is ambiguous. Make the label match the actual backend behavior.

### Admin Delivery Page

`AdminEBookletPurchaseDeliveryPage.jsx` and `AdminEBookletPurchaseDeliveryForm` remain the source of truth for operational delivery.

This page must clearly show and control:

- Payment approval status.
- Custom template/document preparation.
- Teacher-specific uploaded document if applicable.
- Expiry date.
- Invite quota.
- Marketing/internal price if editable in this flow.
- Delivery status.
- Created/delivered instance.
- Teacher access grant state.

After successful delivery:

- Purchase should become `delivered`.
- Teacher `/e-booklet-orders` should show `delivered` after reload.
- Teacher should see `Manage Access` if an instance ID is available.
- Teacher `/teacher/e-booklets` library should include the delivered e-booklet.

### Admin Notes And Teacher Visibility

If admin sets a status requiring teacher awareness, teacher details should show a useful message.

Examples:

- `needs_branding_info`: show what information is needed if `admin_notes` or equivalent is available.
- `rejected`: show rejection reason if available.
- `cancelled`: show cancellation reason if available.

If backend does not currently expose this field to `/e-booklet-orders`, decide whether to expose sanitized admin notes or add a teacher-facing message field.

Do not expose private internal admin notes unless they are intended for teachers.

## Backend Contract Requirements

### Teacher Orders Endpoint

Endpoint:

- `GET /e-booklet-orders`

Expected query params:

- `status`, optional, omitted for all statuses.
- `page`, optional.
- `limit`, optional.

Expected response shape:

- `success: true`
- `data: []`
- `total`
- `page`
- `limit`

Important behavior:

- `status=all` should not be sent by frontend.
- If backend receives `status=all`, it may return no results; frontend should prevent this.
- Backend should include enough order data for teacher card/details display.

### Admin Purchases Endpoint

Endpoint:

- `GET /admin/e-booklet-purchases`

Expected query params:

- `status`, optional, omitted for all statuses.
- `page`, optional.
- `limit`, optional.

Expected response shape:

- `success: true`
- `data: []`
- `total`
- `page`
- `limit`

### Payment Approval Endpoint

Endpoint:

- `POST /admin/e-booklet-purchases/:id/mark-paid`

Required verification:

- Confirm whether this persists `paid` or jumps to `ready`.
- Update admin action labels and teacher status copy accordingly.
- If it jumps to `ready`, do not tell teachers the order is merely paid if it is already unlocked/ready.

### Delivery Endpoint

Endpoint:

- `POST /admin/e-booklet-purchases/:id/deliver`

Required verification:

- Purchase becomes `delivered`.
- Instance exists or is created.
- Teacher active access exists.
- Teacher `/e-booklet-orders` returns the delivered order.
- Teacher `/teacher/e-booklets` returns the delivered instance/library item.

## Hook Requirements

### `useEBookletOrders`

Extend the hook in `kalima-platform/frontend/src/hooks/useEBooklets.js`.

Required state:

- `orders`
- `pagination`
- `filters`
- `loading`
- `error`

Required actions:

- `fetchOrders(params)`
- `setStatus(status)`
- `setPage(page)`
- Optional `refresh()` alias.

Required behavior:

- Store `filters.status`.
- Omit status when status is empty or `all`.
- Reset page to `1` when status changes.
- Include current `page` and `limit` in fetch requests.
- Convert backend `total/page/limit` into frontend `pages`.
- Preserve stable callback dependencies so page effects do not refetch infinitely.

## Translation Requirements

Namespace:

- `eBooklets`

Required teacher keys:

- `orders.title`
- `orders.description`
- `orders.badge`
- `orders.openStore`
- `orders.openLibrary`
- `orders.trackOrder`
- `orders.manageAccess`
- `orders.viewDetails`
- `orders.submittedAt`
- `orders.total`
- `orders.noOrders`
- `orders.noOrdersDescription`
- `orders.noOrdersForStatus`
- `orders.loadError`
- `orders.actions.expandItems`
- `orders.actions.collapseItems`
- `orders.details.title`
- `orders.sections.summary`
- `orders.sections.eBooklet`
- `orders.sections.payment`
- `orders.sections.delivery`
- `orders.sections.adminMessage`

Required status keys:

- `orders.status.all`
- `orders.statuses.pending`
- `orders.statuses.awaiting_payment`
- `orders.statuses.paid`
- `orders.statuses.needs_branding_info`
- `orders.statuses.customization_in_progress`
- `orders.statuses.ready`
- `orders.statuses.delivered`
- `orders.statuses.rejected`
- `orders.statuses.cancelled`
- `orders.statuses.unknown`

Required status copy keys:

- `orders.statusCopy.pending`
- `orders.statusCopy.awaiting_payment`
- `orders.statusCopy.paid`
- `orders.statusCopy.needs_branding_info`
- `orders.statusCopy.customization_in_progress`
- `orders.statusCopy.ready`
- `orders.statusCopy.delivered`
- `orders.statusCopy.rejected`
- `orders.statusCopy.cancelled`
- `orders.statusCopy.unknown`

Admin keys should reuse the same status labels where possible.

RTL/Arabic requirements:

- Arabic labels must not rely on English status fallback.
- Dialog direction should respect `i18n.dir()`.
- Status filter should remain horizontally scrollable on narrow screens.

## Testing And Validation

### Unit/Component Tests

Add or update tests for:

- `useEBookletOrders` omits `status` for `all`.
- `useEBookletOrders` sends status for real statuses.
- `useEBookletOrders` calculates `pages` from `total/limit`.
- Status change resets page to `1`.
- E-booklet order card shows correct actions per status.
- Details dialog handles missing fields safely.
- Expand/collapse works for e-booklet items.
- `delivered` status is included in shared status contract.

### Backend/Service Tests

Add or update tests for:

- `listPublicOrders` filters by status.
- `listPublicOrders` paginates correctly.
- `listPublicOrders` includes `delivered` orders for teachers.
- Delivery flow creates or updates instance and teacher access.
- Admin status update is reflected in teacher order list.

Existing likely test area:

- `kalima-platform/backend/tests/e-booklet/e-booklet.service.spec.ts`

### Manual Smoke Tests

Use the Kalima local dev tunnel workflow before starting or testing local frontend/backend dev servers.

Teacher smoke:

- Visit `/e-booklet-orders` at `1593x891`.
- Verify layout matches `/teacher/orders` card organization.
- Filter by each status.
- Confirm `all` returns all statuses.
- Confirm empty filtered state is correct.
- Open details dialog.
- Expand/collapse items.
- Click track/contact CTA and verify it opens intended URL.
- For `ready` or `delivered`, click `Manage Access` and verify route.
- Verify pagination previous/next/page links.

Admin smoke:

- Visit `/admin/e-booklets/orders`.
- Filter by each status.
- Confirm `all` does not send literal `status=all`.
- Open delivery page for a purchase.
- Mark/approve payment.
- Deliver purchase.
- Return to admin list and confirm status.
- Reload teacher `/e-booklet-orders` and confirm matching status/action.
- Open teacher `/teacher/e-booklets` and confirm delivered e-booklet appears.

### Visual Acceptance Criteria

At viewport `1593x891`:

- E-booklet order card width and rhythm should feel aligned with `/teacher/orders`.
- Status filter sits above the list and remains usable.
- Card hover state matches normal orders.
- Details and item sections do not overflow.
- Long Arabic or English titles truncate/wrap cleanly.

At mobile widths:

- Header stacks above filter.
- Filter scrolls horizontally if needed.
- Card header stacks cleanly.
- Actions wrap without overlap.
- Details dialog remains scrollable.

## Risks And Mitigations

Risk: e-booklet purchase payload differs from normal purchase payload.

Mitigation: create e-booklet-specific components that copy the pattern instead of reusing `OrderCard` directly.

Risk: admin and teacher status lists drift again.

Mitigation: centralize canonical statuses in `eBookletOrdersContract.mjs` and import them in both admin and teacher pages.

Risk: `all` status accidentally sent to backend.

Mitigation: normalize params in hooks and add tests.

Risk: teacher sees status but cannot understand what to do next.

Mitigation: add status copy and clear action mapping per status.

Risk: admin notes expose private/internal content.

Mitigation: only expose a teacher-facing message field or explicitly sanitized admin notes.

Risk: `mark-paid` semantic mismatch.

Mitigation: verify backend behavior before naming UI actions; label the action based on actual transition.

Risk: delivery appears complete but teacher access is missing.

Mitigation: admin UI should show instance/access state, and backend tests should prove delivery grants active teacher access.

## Definition Of Done

- `/e-booklet-orders` visually and functionally mirrors the strong parts of `/teacher/orders`.
- Teacher can filter e-booklet orders by status and paginate results.
- Teacher can open e-booklet order details.
- Teacher can expand e-booklet order items.
- Teacher can track/contact support from active order cards.
- Teacher sees `Manage Access` for ready/delivered e-booklet orders with an instance.
- Admin and teacher use the same canonical status labels.
- `delivered` is part of the shared status contract.
- `all` status is UI-only and never sent as a backend filter.
- Admin delivery/status updates are reflected on teacher page reload.
- Tests cover status filtering, pagination, status contract, and action visibility.
- Manual smoke passes for teacher and admin flows.
