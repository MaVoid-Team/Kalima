# Post-Purchase WhatsApp Message Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-dev (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the Arabic post-purchase WhatsApp message with the approved greeting and a less-than-24-hours readiness promise.

**Architecture:** Keep the existing message builder unchanged and update only the Arabic translation values it consumes. Add a focused Node source-contract test that reads the real Arabic locale file and asserts the exact customer-facing copy.

**Tech Stack:** React, i18next JSON translations, Node.js assertions.

## Global Constraints

- Preserve all order details, totals, support copy, and closing text.
- Do not change non-Arabic messages or order-processing behavior.
- The exact greeting is `اهلا بك أ/ {{name}}`.
- The message must say `طلبك هيكون جاهز في أقل من 24 ساعة.`.

### Task 1: Arabic post-purchase WhatsApp copy

- Create: `kalima-platform/frontend/tests/order-whatsapp-message-source-check.mjs`
- Modify: `kalima-platform/frontend/src/locales/ar/admin.json:222-223`
- Consumes: Existing `orders.actions.whatsappGreeting` and `orders.actions.whatsappSuccess` keys used by `OrderActions`.
- Produces: Updated Arabic message values and a repeatable regression check.

- [ ] **Step 1: Write the failing test**

```js
import fs from 'node:fs';
import assert from 'node:assert/strict';

const locale = JSON.parse(fs.readFileSync(
  new URL('../src/locales/ar/admin.json', import.meta.url),
  'utf8',
));

assert.equal(locale.orders.actions.whatsappGreeting, 'اهلا بك أ/ {{name}}');
assert.equal(
  locale.orders.actions.whatsappSuccess,
  'تم استلام طلبك بنجاح، وجارٍ تجهيزه الآن.\nطلبك هيكون جاهز في أقل من 24 ساعة.',
);
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node tests/order-whatsapp-message-source-check.mjs`

Expected: FAIL because the greeting still uses `هلاً` and the readiness sentence is absent.

- [ ] **Step 3: Apply the minimum translation update**

Set `whatsappGreeting` and `whatsappSuccess` to the exact values asserted by the test.

- [ ] **Step 4: Verify automated checks**

Run: `node tests/order-whatsapp-message-source-check.mjs`

Expected: PASS.

Run: `npm run build`

Expected: Vite production build exits successfully.

- [ ] **Step 5: Verify the visible message**

Open an administrator order in the local application, choose the WhatsApp action, and confirm both changed lines appear in the editable message dialog.

Capture a screenshot with both lines highlighted.
