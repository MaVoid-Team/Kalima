import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const app = fs.readFileSync(new URL('src/App.jsx', root), 'utf8');
const hook = fs.readFileSync(new URL('src/hooks/useEBooklets.js', root), 'utf8');
const pagePath = new URL('src/pages/e-booklets/EBookletOrdersPage.jsx', root);
const page = fs.existsSync(pagePath) ? fs.readFileSync(pagePath, 'utf8') : '';

assert.match(app, /const EBookletOrdersPage\s*=\s*lazy\([\s\S]*?EBookletOrdersPage[\s\S]*?\);/, 'App must lazy-load the dedicated e-booklet orders page');
assert.match(app, /path="\/e-booklet-orders"\s+element=\{<EBookletOrdersPage\s*\/>\}/, 'App must register /e-booklet-orders route');
assert.match(hook, /export function useEBookletOrders\s*\(/, 'hook must expose useEBookletOrders');
assert.match(hook, /endpoint:\s*"\/e-booklet-orders"/, 'orders hook must call /e-booklet-orders API');
assert.match(page, /useEBookletOrders\(/, 'orders page must use the e-booklet orders hook');
assert.match(page, /e_booklet_student_purchase_links/, 'orders page must render item-level e-booklet purchase links, not generic store orders');
assert.match(page, /status/i, 'orders page must show order status');
assert.match(page, /serial|purchase_serial|reference/i, 'orders page must show the order reference/serial');
assert.match(page, /\/teacher\/e-booklets\/\$\{[^}]+\}\/invites|E_BOOKLET_TEACHER_LIBRARY_ROUTE/, 'orders page must route approved/ready teacher purchases to teacher e-booklet management');
assert.doesNotMatch(page, /<Link to="\/student\/e-booklets">[\s\S]{0,240}\{t\("orders\.manageAccess"\)\}/, 'orders page must not route teacher purchase management to the student library');
assert.doesNotMatch(page, /useOrders|\/orders"|\/api\/orders/, 'orders page must not reuse generic store order endpoints');

console.log('Build Order 7 e-booklet orders page source contract passed');
