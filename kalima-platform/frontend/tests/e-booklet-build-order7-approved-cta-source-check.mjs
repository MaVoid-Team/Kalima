import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const page = fs.readFileSync(new URL('src/pages/e-booklets/EBookletOrdersPage.jsx', root), 'utf8');

assert.match(page, /const getManagementPath\s*=\s*\(link\)\s*=>/, 'orders page must derive a teacher-management path per approved e-booklet item');
assert.match(page, /booklet_instance\?\.id|instance_id/, 'management path must use the approved e-booklet instance id');
assert.match(page, /\/teacher\/e-booklets\/\$\{[^}]+\}\/invites/, 'approved CTA must point to teacher invite/access management');
assert.match(page, /const getStatus\s*=\s*\(value\)\s*=>/, 'orders page must normalize order/link status before gating CTAs');
assert.match(page, /\["approved",\s*"ready",\s*"confirmed"\]\.includes\(linkStatus\)/, 'management CTA must be gated by normalized approved/ready/confirmed item status');
assert.match(page, /\["ready",\s*"confirmed"\]\.includes\(orderStatus\)/, 'fallback order-level management CTA gate must be normalized and delivery-related');
assert.doesNotMatch(page, /<Link to="\/student\/e-booklets">[\s\S]{0,240}\{t\("orders\.manageAccess"\)\}/, 'approved item CTA must not route teacher purchases to the student library');

console.log('Build Order 7 approved e-booklet management CTA source contract passed');
