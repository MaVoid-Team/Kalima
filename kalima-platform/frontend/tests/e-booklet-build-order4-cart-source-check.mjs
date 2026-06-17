import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');

const hook = read('src/hooks/useEBooklets.js');
const detailsPage = read('src/pages/e-booklets/EBookletDetailsPage.jsx');
const cartPage = read('src/pages/e-booklets/EBookletCartPage.jsx');

assert.match(hook, /const addTemplate = useCallback/, 'cart hook must expose addTemplate for multi-item add-to-cart');
assert.doesNotMatch(hook, /writeCart\(\[item\]\)/, 'cart add must not replace the whole cart with one item');
assert.match(hook, /readCart\(\)/, 'cart add/remove must derive from current localStorage cart');
assert.match(hook, /String\(item\.template_id\) === String\(nextItem\.template_id\)/, 'cart add must de-dupe by template_id');
assert.match(hook, /const subtotal = useMemo[\s\S]*items\.reduce/, 'cart subtotal must sum all items');
assert.match(hook, /const discount = 0/, 'cart hook must expose an explicit discount field even when no discount applies yet');
assert.match(hook, /const total = subtotal - discount/, 'cart total must derive from subtotal minus discount');
assert.match(hook, /const count = useMemo[\s\S]*items\.length/, 'cart hook must expose item count for badges/summary');
assert.match(hook, /addTemplate,/, 'cart hook return value must include addTemplate');
assert.match(hook, /removeItem,/, 'cart hook return value must include removeItem');
assert.match(hook, /clear,/, 'cart hook return value must include clear');

assert.match(detailsPage, /const \{ addTemplate \} = useEBookletCart\(\)/, 'detail page must add without replacing existing cart items');
assert.match(detailsPage, /addTemplate\(template\)/, 'detail CTA must call addTemplate');
assert.doesNotMatch(detailsPage, /replaceWithTemplate\(template\)/, 'detail CTA must not replace existing cart items');

assert.match(cartPage, /const \{ items, total, currency, removeItem, clear, count \} = useEBookletCart\(\)/, 'cart page must render all cart items and expose count/clear');
assert.match(cartPage, /items\.map\(\(item\)/, 'cart page must render each item, not only the first item');
assert.doesNotMatch(cartPage, /const \{ item, total, currency, removeItem \} = useEBookletCart\(\)/, 'cart page must not be single-item only');
assert.match(cartPage, /onClick=\{clear\}/, 'cart page must expose clear cart behavior');

console.log('Build Order 4 multi-item e-booklet cart source contract passed');
