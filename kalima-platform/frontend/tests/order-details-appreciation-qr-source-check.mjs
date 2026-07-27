import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const purchasesService = fs.readFileSync(
  new URL('../backend/src/apps/store-api/services/purchases.service.ts', root),
  'utf8',
);
const orderDetails = fs.readFileSync(
  new URL('src/pages/admin/orders/OrderDetailPage.jsx', root),
  'utf8',
);

assert.match(
  purchasesService,
  /users:\s*\{\s*select:\s*\{[^}]*role:\s*true/,
  'normal market order responses must identify whether the purchaser is a teacher',
);
assert.match(
  orderDetails,
  /<AppreciationQrButton\s+userId=\{order\.users\.id\}\s*\/>/,
  'order details must generate the appreciation QR for the purchaser attached to that order',
);
assert.match(
  orderDetails,
  /isTeacher[\s\S]*?<AppreciationQrButton/,
  'the order details QR action must only be available for teacher purchasers',
);

console.log('Order details appreciation QR source contract passed');
