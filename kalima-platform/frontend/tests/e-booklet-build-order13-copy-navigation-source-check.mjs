import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));

const en = json('src/locales/en/eBooklets.json');
const ar = json('src/locales/ar/eBooklets.json');
const landingEn = json('src/locales/en/landing.json');
const landingAr = json('src/locales/ar/landing.json');
const teacherEn = json('src/locales/en/teacher.json');
const teacherAr = json('src/locales/ar/teacher.json');
const studentEn = json('src/locales/en/student.json');
const studentAr = json('src/locales/ar/student.json');

for (const [label, bundle] of [['en', en], ['ar', ar]]) {
  assert.ok(bundle.orders, `${label} eBooklets orders namespace is present`);
  for (const key of ['badge', 'title', 'description', 'openLibrary', 'openStore', 'loadError', 'emptyTitle', 'emptyDescription', 'itemStatus', 'manageAccess', 'count', 'fallbackTitle', 'submittedAt']) {
    assert.equal(typeof bundle.orders[key], 'string', `${label} orders.${key} is translated`);
    assert.ok(bundle.orders[key].trim().length > 0, `${label} orders.${key} is not empty`);
  }
  for (const status of ['pending', 'approved', 'confirmed', 'ready', 'rejected', 'cancelled', 'unknown']) {
    assert.equal(typeof bundle.orders.statuses[status], 'string', `${label} status ${status} label exists`);
    assert.equal(typeof bundle.orders.statusCopy[status], 'string', `${label} status ${status} copy exists`);
  }
}

assert.equal(landingEn.navbar.eBookletOrders, 'E-Booklet Orders');
assert.equal(landingAr.navbar.eBookletOrders, 'طلبات البوكليت');
assert.equal(teacherEn.nav.eBookletOrders, 'E-Booklet Orders');
assert.equal(teacherAr.nav.eBookletOrders, 'طلبات البوكليت');
assert.equal(studentEn.nav.eBookletOrders, 'E-Booklet Orders');
assert.equal(studentAr.nav.eBookletOrders, 'طلبات البوكليت');

const ordersPage = read('src/pages/e-booklets/EBookletOrdersPage.jsx');
assert.match(ordersPage, /orders\.statusCopy\./, 'orders page explains status meanings');
assert.match(ordersPage, /orders\.statuses\./, 'orders page uses translated status labels');
assert.match(ordersPage, /orders\.openStore/, 'orders page has storefront CTA');
assert.match(ordersPage, /orders\.openLibrary/, 'orders page has library CTA');
assert.doesNotMatch(ordersPage, /defaultValue:\s*"/, 'orders page should rely on locale keys, not English default strings');

const navbar = read('src/layouts/Navbar.jsx');
const teacherSidebar = read('src/components/teacher/TeacherSidebar.jsx');
const studentSidebar = read('src/components/student/StudentSidebar.jsx');
for (const [label, source] of [['navbar', navbar], ['teacher sidebar', teacherSidebar], ['student sidebar', studentSidebar]]) {
  assert.match(source, /eBookletOrders/, `${label} links to dedicated e-booklet orders copy`);
  assert.match(source, /\/e-booklet-orders/, `${label} exposes dedicated e-booklet orders route`);
}
assert.doesNotMatch(navbar, /e-booklet-invite|e-booklet-code/, 'public navbar must not advertise private redemption routes');

console.log('Build Order 13 copy/navigation source checks passed');
