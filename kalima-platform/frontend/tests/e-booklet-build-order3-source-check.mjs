import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');

const app = read('src/App.jsx');
const detailsPage = read('src/pages/e-booklets/EBookletDetailsPage.jsx');
const hook = read('src/hooks/useEBooklets.js');
const storePage = read('src/pages/e-booklets/EBookletStorePage.jsx');

assert.match(app, /<Route path="\/e-booklets\/instances\/:instanceId" element=\{<EBookletDetailsPage \/>\}/, 'legacy public instance route must still be registered for old shared links');
assert.match(app, /<Route path="\/e-booklets\/:templateId" element=\{<EBookletDetailsPage \/>\}/, 'canonical template detail route must be registered');

assert.match(storePage, /to=\{`\/e-booklets\/\$\{template\.template_id \|\| template\.id\}`\}/, 'catalog cards must link to canonical template detail route');
assert.doesNotMatch(storePage, /to=\{`\/e-booklets\/instances\//, 'catalog cards must not create new legacy public instance links');

assert.match(hook, /legacyInstance[\s\S]{0,160}\/e-booklet-store\/instances\/\$\{templateId\}/, 'legacy detail fetch must still resolve old instance IDs through the legacy API');
assert.match(hook, /:\s*`\/e-booklet-store\/\$\{templateId\}`/, 'canonical detail fetch must use template ID API');

assert.match(detailsPage, /legacyInstanceRoute/, 'details page must detect legacy instance route');
assert.match(detailsPage, /const canonicalTemplateId = template\?\.template_id \|\| template\?\.templateId \|\| template\?\.template\?\.id/, 'legacy instance detail must derive canonical template id from resolved legacy instance payload');
assert.match(detailsPage, /navigate\(`\/e-booklets\/\$\{canonicalTemplateId\}`[^)]*replace:\s*true/s, 'legacy instance detail must redirect/replace to canonical template route after resolving the template id');
assert.match(detailsPage, /navigate\("\/e-booklets"[^)]*replace:\s*true/s, 'legacy instance detail must safely fall back to catalog when no template id can be resolved');

console.log('Build Order 3 legacy e-booklet route redirect source contract passed');
