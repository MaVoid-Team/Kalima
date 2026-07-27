# Required Post-Purchase Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-dev (recommended) or superpowers:executing-plans to implement this plan task-by-task.
> Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the real checkout receipt non-dismissible and expose `Track your order` as its only action.

**Architecture:** Keep the existing `PaymentStep` receipt and WhatsApp URL generation.
Restrict the Radix alert dialog's dismissal events, remove the three competing actions, and promote the existing tracking link to one primary full-width button.

**Tech Stack:** React 19, Radix Alert Dialog, Tailwind CSS, Lucide React, Node.js source-contract tests, Codex in-app Browser.

## Global Constraints

- Keep the receipt content, purchase serial, item data, and WhatsApp message unchanged.
- The only visible receipt action is `Track your order`.
- Outside clicks and Escape must not dismiss the receipt.
- The tracking link opens in a new tab and leaves the receipt open.
- Do not modify the standalone success card, fast-buy checkout, or order creation logic.

## File Structure

- Create `kalima-platform/frontend/e2e/required-post-purchase-tracking.spec.js` to enforce the rendered receipt action and dismissal contract.
- Modify `kalima-platform/frontend/src/components/checkout/steps/PaymentStep.jsx` to implement the required tracking handoff.
- Modify `kalima-platform/frontend/src/locales/en/checkout.json` and `kalima-platform/frontend/src/locales/ar/checkout.json` to add the short tracking instruction.

### Task 1: Required Tracking Handoff

- Create: `kalima-platform/frontend/e2e/required-post-purchase-tracking.spec.js`
- Modify: `kalima-platform/frontend/src/components/checkout/steps/PaymentStep.jsx:194-266`
- Modify: `kalima-platform/frontend/src/locales/en/checkout.json`
- Modify: `kalima-platform/frontend/src/locales/ar/checkout.json`
- Consumes: Existing `trackingLink: string`, `MessageCircle`, and `receipt.trackOrder` translation.
- Produces: A non-dismissible receipt dialog with one external WhatsApp action.

- [ ] **Step 1: Write the failing browser behavior test**

```js
const receipt = page.getByRole('alertdialog', { name: 'Purchase Receipt' });
await expect(receipt.getByRole('link')).toHaveCount(1);
await expect(receipt.getByRole('button')).toHaveCount(0);
await page.keyboard.press('Escape');
await expect(receipt).toBeVisible();
await page.mouse.click(10, 120);
await expect(receipt).toBeVisible();
```

- [ ] **Step 2: Run the test and verify the current UI fails the contract**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 npx playwright test e2e/required-post-purchase-tracking.spec.js
```

Expected: The test fails because the receipt still exposes competing actions and can be dismissed.

- [ ] **Step 3: Implement the minimal receipt change**

Replace the receipt dialog state handler with a controlled dialog that cannot close itself:

```jsx
<AlertDialog open={showReceipt}>
  <AlertDialogContent
    className="max-w-xl p-6 print:hidden"
    onEscapeKeyDown={(event) => event.preventDefault()}
    onPointerDownOutside={(event) => event.preventDefault()}
  >
```

Remove `handlePrintReceipt`, the Print button, View My Orders button, and `AlertDialogCancel`.
Keep `PrintableReceipt` unchanged because it does not render on screen outside print media.

Add the instruction immediately above the action:

```jsx
<p className="text-center text-sm font-medium text-muted-foreground">
  {t('receipt.trackOrderRequired')}
</p>
```

Promote the remaining action:

```jsx
<Button
  asChild
  size="lg"
  className="w-full bg-success text-success-foreground hover:bg-success/90"
  data-testid="checkout-payment-step-receipt-track-order-button"
>
  <a href={trackingLink} target="_blank" rel="noopener noreferrer">
    <MessageCircle className="h-5 w-5" />
    {t('receipt.trackOrder')}
  </a>
</Button>
```

Add English copy:

```json
"trackOrderRequired": "Continue on WhatsApp to track your order."
```

Add Arabic copy:

```json
"trackOrderRequired": "تابع على واتساب لتتبع طلبك."
```

- [ ] **Step 4: Run focused and build verification**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:5174 npx playwright test e2e/required-post-purchase-tracking.spec.js
npm --prefix kalima-platform/frontend run build
```

Expected: The browser test passes, and Vite completes the production build.

- [ ] **Step 5: Verify the real UI**

Complete a free local purchase through `http://localhost:5174/cart`.
Confirm the dialog exposes only one action named `Track your order`.
Press Escape and confirm the alert dialog remains visible.
Click outside the dialog and confirm it remains visible.
Confirm the link target contains the generated purchase serial.
Capture a screenshot of the real app with the popup visible.

- [ ] **Step 6: Commit the implementation**

```bash
git add \
  kalima-platform/frontend/src/components/checkout/steps/PaymentStep.jsx \
  kalima-platform/frontend/src/locales/en/checkout.json \
  kalima-platform/frontend/src/locales/ar/checkout.json \
  kalima-platform/frontend/e2e/required-post-purchase-tracking.spec.js
git commit -m "feat: require post-purchase order tracking"
```
