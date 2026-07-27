import fs from 'node:fs';
import assert from 'node:assert/strict';

const locale = JSON.parse(
  fs.readFileSync(
    new URL('../src/locales/ar/admin.json', import.meta.url),
    'utf8',
  ),
);
const orderDetailSource = fs.readFileSync(
  new URL('../src/pages/admin/orders/OrderDetailPage.jsx', import.meta.url),
  'utf8',
);

assert.equal(
  locale.orders.actions.whatsappGreeting,
  'اهلا بك أ/ {{name}}',
  'the Arabic post-purchase message must use the approved greeting',
);
assert.equal(
  locale.orders.actions.whatsappSuccess,
  'تم استلام طلبك بنجاح، وجارٍ تجهيزه الآن.\nطلبك هيكون جاهز في أقل من 24 ساعة.',
  'the Arabic post-purchase message must promise readiness in less than 24 hours',
);
assert.match(
  orderDetailSource,
  /`اهلا بك أ\/ \$\{order\?\.users\?\.name \|\| '-'\}`/,
  'the order-details dialog must use the approved greeting',
);
assert.match(
  orderDetailSource,
  /'طلبك هيكون جاهز في أقل من 24 ساعة\.'/,
  'the order-details dialog must include the readiness promise',
);

console.log('Arabic post-purchase WhatsApp message contract passed');
