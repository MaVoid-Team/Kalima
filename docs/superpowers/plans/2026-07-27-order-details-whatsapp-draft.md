# Order Details WhatsApp Draft Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-dev (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the order-details WhatsApp action open a prefilled WhatsApp draft that requires the admin to press Send.

**Architecture:** Keep the existing editable message preview, but replace Kalima's server-side WhatsApp send call with a `wa.me` popup. Remove the order page's sender-connection gate because drafting in WhatsApp does not depend on Kalima's connected sender session.

**Tech Stack:** React 19, Playwright, WhatsApp click-to-chat URL.

## Global Constraints

- Never send the message through Kalima's WhatsApp API from this action.
- Preserve the existing Arabic template and editable preview.
- Open WhatsApp in a new browser window or tab with the edited draft encoded in the URL.
- Normalize Egyptian local phone numbers to WhatsApp's international format.
- Keep changes limited to the order-details action and its regression test.

## Task 1: WhatsApp Draft Behavior

- Modify: `kalima-platform/frontend/src/pages/admin/orders/OrderDetailPage.jsx`
- Create: `kalima-platform/frontend/src/lib/whatsappDraft.js`
- Create: `kalima-platform/frontend/src/lib/whatsappDraft.test.js`
- Consumes: Existing order fixture API shape and `order-detail-whatsapp-button`.
- Produces: A popup URL matching `https://wa.me/<phone>?text=<encoded draft>` with no automatic message API request.

- [x] **Step 1: Write the failing test**

Create a Node test that injects a popup recorder and asserts the exact encoded `wa.me` URL, `_blank` target, and `noopener,noreferrer` features.

- [x] **Step 2: Run the test to verify it fails**

Run: `node --test src/lib/whatsappDraft.test.js`

Expected: FAIL because the WhatsApp draft helper does not exist.

- [x] **Step 3: Write the minimal implementation**

Remove the sender-session gate and connection dialog from `OrderDetailPage`.
Change `handleWhatsAppSend` to call:

```js
openWhatsAppDraft({ phone: whatsappPhone, message: editableWhatsAppMessage || whatsappMessage });
setIsWhatsAppDialogOpen(false);
```

- [x] **Step 4: Run focused verification**

Run:

```sh
node --test src/lib/whatsappDraft.test.js
npm run build
```

Expected: The regression test passes and the production build exits successfully.

- [x] **Step 5: Capture UI proof**

Use Codex's in-app browser to open the mocked local order detail, highlight the editable confirmation dialog, and save a screenshot under `.codex/e2e-proof/order-detail-whatsapp-draft/`.
