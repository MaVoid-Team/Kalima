import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const page = fs.readFileSync(new URL('src/pages/e-booklets/EBookletOrdersPage.jsx', root), 'utf8');

assert.match(page, /const getManagementPath\s*=\s*\(link\)\s*=>/, 'orders page must derive a teacher-management path per approved e-booklet item');
assert.match(page, /booklet_instance\?\.id|instance_id/, 'management path must use the approved e-booklet instance id');
assert.match(page, /\/teacher\/e-booklets\/\$\{[^}]+\}\/invites/, 'approved CTA must point to teacher invite/access management');
assert.match(page, /link\.status === "approved"/, 'approved CTA must be gated by approved item status');
assert.doesNotMatch(page, /link\.status === "approved"[\s\S]{0,240}<Link to="\/student\/e-booklets"/, 'approved item CTA must not route teacher purchases to the student library');

console.log('Build Order 7 approved e-booklet management CTA source contract passed');
