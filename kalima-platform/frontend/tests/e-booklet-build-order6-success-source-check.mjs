import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const checkoutPage = fs.readFileSync(new URL('src/pages/e-booklets/EBookletCheckoutPage.jsx', root), 'utf8');

assert.match(
  checkoutPage,
  /const submittedPurchaseSerial\s*=\s*submittedPurchase\?\.(purchase_serial|purchaseSerial|serial)/,
  'success state must derive and display the e-booklet purchase serial/reference from the checkout response',
);
assert.match(
  checkoutPage,
  /const submittedPurchaseStatus\s*=\s*submittedPurchase\?\.(status|review_status|reviewStatus)/,
  'success state must derive and display the e-booklet purchase status from the checkout response',
);
assert.match(
  checkoutPage,
  /submittedPurchaseSerial[\s\S]*submittedPurchaseStatus/,
  'success receipt must render both serial/reference and status',
);
assert.match(
  checkoutPage,
  /to="\/e-booklet-orders"/,
  'success CTA must route to the dedicated e-booklet orders page',
);
assert.doesNotMatch(
  checkoutPage,
  /to="\/student\/e-booklets"[\s\S]*Open my e-booklets/,
  'success CTA must not send pending purchases to the student library as the primary destination',
);

console.log('Build Order 6 e-booklet checkout success source contract passed');
