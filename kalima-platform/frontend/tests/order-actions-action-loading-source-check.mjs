import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const source = fs.readFileSync(
  new URL('src/components/admin/orders/OrderActions.jsx', root),
  'utf8',
);

assert.match(
  source,
  /const\s*\{[\s\S]*?actionLoading[\s\S]*?\}\s*=\s*useOrders\(\)/,
  'OrderActions must read actionLoading from useOrders before using it',
);
assert.match(
  source,
  /disabled=\{actionLoading\}/,
  'the delivered action must stay disabled while an order action is running',
);

console.log('Order actions action-loading source contract passed');
