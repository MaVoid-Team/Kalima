import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');
const backendRead = (path) => fs.readFileSync(new URL(`../backend/${path}`, root), 'utf8');

const app = read('src/App.jsx');
const acceptPage = read('src/pages/e-booklets/AcceptEBookletInvitePage.jsx');
const hook = read('src/hooks/useEBookletAccess.js');
const studentPage = read('src/pages/student/e-booklets/StudentEBookletsPage.jsx');
const en = read('src/locales/en/eBooklets.json');
const ar = read('src/locales/ar/eBooklets.json');
const redemptionService = backendRead('src/apps/store-api/services/e-booklet-redemption.service.ts');
const backendRoutes = backendRead('src/apps/store-api/routes/v2/e-booklet.routes.ts');

assert.match(app, /\/e-booklet-code/, 'student code redemption route must be registered');
assert.match(app, /AcceptEBookletInvitePage/, 'code redemption route must render the existing invite/code acceptance surface');

assert.match(hook, /redeemAccessCode/, 'student hook must expose redeemAccessCode');
assert.match(hook, /\/e-booklet-access-codes\/redeem/, 'student hook must call backend access-code redemption endpoint');
assert.match(hook, /data:\s*\{[\s\S]*code[\s\S]*termsAccepted[\s\S]*termsVersion[\s\S]*\}/, 'redeemAccessCode must send axios data payload with code and terms acceptance');
assert.doesNotMatch(hook, /body:\s*\{[\s\S]*code[\s\S]*termsAccepted/, 'redeemAccessCode must not use unsupported body payload key');

assert.match(acceptPage, /mode[\s\S]{0,40}"code"/, 'accept page must support direct code mode');
assert.match(acceptPage, /data-testid="e-booklet-code-redemption-form"/, 'code mode must render a code redemption form');
assert.match(acceptPage, /redeemAccessCode\(/, 'code mode must submit through redeemAccessCode');
assert.match(acceptPage, /counted_for_progress/, 'code mode must still display paid/free success copy when backend does not return instance id');
assert.match(acceptPage, /if \(instanceId\)/, 'code mode must navigate for paid and free code redemptions when access was granted');
assert.match(acceptPage, /freeAccessNoPaidProgressSuccess/, 'free code success copy must say access opens without paid-seat/milestone reward credit');
assert.doesNotMatch(acceptPage, /counted_for_progress\s*&&\s*instanceId/, 'free code redemption must not be stranded by paid-only navigation');
assert.doesNotMatch(acceptPage, /free[\s\S]{0,80}milestone progress/i, 'free code UI must not imply free codes count toward paid milestone progress');

assert.match(studentPage, /\/e-booklet-code/, 'student empty state must offer code redemption');
assert.match(studentPage, /redeemCodeCta/, 'student empty state must use code redemption CTA copy');

assert.match(backendRoutes, /"\/e-booklet-access-codes\/redeem"[\s\S]*\.\.\.studentAuth[\s\S]*redeemAccessCode/, 'access code redemption route must require student auth');
assert.match(redemptionService, /const access = await this\.grantViewerAccess/, 'paid and free code redemption must grant viewer access');
assert.match(redemptionService, /counted_for_progress:\s*isPaid/, 'only paid code redemptions count toward paid progress');
assert.match(redemptionService, /access_id:\s*access\?\.id\s*\?\?\s*null/, 'redemption must persist granted access id when access was created');

for (const [localeName, locale] of [['en', en], ['ar', ar]]) {
  assert.match(locale, /codeRedemption/, `${localeName} locale must include code redemption copy`);
  assert.match(locale, /freeAccessNoPaidProgressSuccess/, `${localeName} locale must include free-code access/no-paid-progress success copy`);
  assert.match(locale, /redeemCodeCta/, `${localeName} locale must include student redeem-code CTA`);
}

console.log('Phase 7 student code redemption source contract passed');
