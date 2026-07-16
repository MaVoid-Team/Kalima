import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const backendService = fs.readFileSync(
  new URL('../backend/src/apps/store-api/services/purchases.service.ts', root),
  'utf8',
);
const adminItems = fs.readFileSync(
  new URL('src/components/admin/orders/OrderItemsTable.jsx', root),
  'utf8',
);
const customerDetails = fs.readFileSync(
  new URL('src/components/orders/OrderDetailsDialog.jsx', root),
  'utf8',
);
const customerItems = fs.readFileSync(
  new URL('src/components/orders/OrderItemsCollapsible.jsx', root),
  'utf8',
);

assert.match(
  backendService,
  /products:\s*\{[\s\S]*?select:\s*\{[\s\S]*?serial:\s*true,/,
  'store purchase responses must include the product serial field',
);

for (const [name, source] of [
  ['admin order items', adminItems],
  ['customer order details', customerDetails],
  ['customer order items', customerItems],
]) {
  assert.match(source, /product(?:\?|)\.serial|product\?\.serial/, `${name} must render the API serial field`);
  assert.doesNotMatch(source, /product_serial/, `${name} must not read the nonexistent product_serial field`);
}

console.log('Store order product serial source contract passed');
