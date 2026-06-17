import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const json = (file) => JSON.parse(read(file));
const importFromRoot = async (file) => import(pathToFileURL(path.join(root, file)).href);

const en = json('src/locales/en/eBooklets.json');
const ar = json('src/locales/ar/eBooklets.json');
const landingEn = json('src/locales/en/landing.json');
const landingAr = json('src/locales/ar/landing.json');
const teacherEn = json('src/locales/en/teacher.json');
const teacherAr = json('src/locales/ar/teacher.json');

const {
  E_BOOKLET_ORDER_STATUSES,
  E_BOOKLET_ORDERS_ALLOWED_ROLES,
  E_BOOKLET_ORDERS_NAV_CONTRACT,
  E_BOOKLET_ORDERS_ROUTE,
  E_BOOKLET_STORE_ROUTE,
  E_BOOKLET_TEACHER_LIBRARY_ROUTE,
} = await importFromRoot('src/pages/e-booklets/eBookletOrdersContract.mjs');

assert.equal(E_BOOKLET_ORDERS_ROUTE, '/e-booklet-orders');
assert.equal(E_BOOKLET_STORE_ROUTE, '/e-booklets');
assert.equal(E_BOOKLET_TEACHER_LIBRARY_ROUTE, '/teacher/e-booklets');
assert.deepEqual(E_BOOKLET_ORDERS_ALLOWED_ROLES, ['Teacher']);
assert.deepEqual(E_BOOKLET_ORDERS_NAV_CONTRACT.allowedRoles, ['Teacher']);
assert.equal(E_BOOKLET_ORDERS_NAV_CONTRACT.visibleInNavbarForTeacher, true);
assert.equal(E_BOOKLET_ORDERS_NAV_CONTRACT.visibleInTeacherSidebar, true);
assert.equal(E_BOOKLET_ORDERS_NAV_CONTRACT.visibleInStudentSidebar, false);
assert.equal(E_BOOKLET_ORDERS_NAV_CONTRACT.studentAccessModel, 'private-url-or-access-code');

for (const [label, bundle] of [['en', en], ['ar', ar]]) {
  assert.ok(bundle.orders, `${label} eBooklets orders namespace is present`);
  for (const key of ['badge', 'title', 'description', 'openLibrary', 'openStore', 'loadError', 'emptyTitle', 'emptyDescription', 'itemStatus', 'manageAccess', 'count', 'fallbackTitle', 'submittedAt']) {
    assert.equal(typeof bundle.orders[key], 'string', `${label} orders.${key} is translated`);
    assert.ok(bundle.orders[key].trim().length > 0, `${label} orders.${key} is not empty`);
  }
  for (const status of E_BOOKLET_ORDER_STATUSES) {
    assert.equal(typeof bundle.orders.statuses[status], 'string', `${label} status ${status} label exists`);
    assert.equal(typeof bundle.orders.statusCopy[status], 'string', `${label} status ${status} copy exists`);
  }
  for (const key of ['teacherPurchaseTitle', 'teacherPurchaseDescriptionPaid', 'teacherPurchaseDescriptionFree', 'terms', 'pendingApprovalNotice', 'freeAccessNotice', 'purchaseSubmittedDescription', 'openEBookletOrders']) {
    assert.equal(typeof bundle.checkout[key], 'string', `${label} checkout.${key} is translated`);
    assert.ok(bundle.checkout[key].trim().length > 0, `${label} checkout.${key} is not empty`);
  }
}

assert.ok(en.checkout.terms.includes('private URL and access code'));
assert.ok(en.checkout.purchaseSubmittedDescription.includes('teacher e-booklet purchase'));
assert.ok(!/student library|student account/i.test(en.checkout.purchaseSubmittedDescription));
assert.ok(!/student library|student account|activated immediately/i.test(en.checkout.terms));
assert.ok(!/activated immediately|student access is activated/i.test(en.checkout.pendingApprovalNotice));
assert.ok(!/activated immediately|student access is activated/i.test(en.checkout.freeAccessNotice));

assert.equal(landingEn.navbar.eBookletOrders, 'E-Booklet Orders');
assert.equal(landingAr.navbar.eBookletOrders, 'طلبات البوكليت');
assert.equal(teacherEn.nav.eBookletOrders, 'E-Booklet Orders');
assert.equal(teacherAr.nav.eBookletOrders, 'طلبات البوكليت');

console.log('Build Order 13 copy/navigation contract checks passed');
