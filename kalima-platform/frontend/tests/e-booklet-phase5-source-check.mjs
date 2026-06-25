import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');

const teacherPage = read('src/pages/teacher/e-booklets/TeacherEBookletsPage.jsx');
const invitePage = read('src/pages/teacher/e-booklets/TeacherInviteManagementPage.jsx');
const hook = read('src/hooks/useEBookletAccess.js');
const en = read('src/locales/en/eBooklets.json');
const ar = read('src/locales/ar/eBooklets.json');

assert.match(teacherPage, /data-testid="teacher-milestone-summary"/, 'teacher list must render milestone progress summary');
assert.match(teacherPage, /data-testid="teacher-milestone-timeline"/, 'teacher list must render milestone timeline');
assert.match(teacherPage, /data-testid="teacher-wallet-balance"/, 'teacher list must render wallet balance');
assert.match(teacherPage, /walletRewardLots/, 'teacher list must read reward lots for wallet expiry display');
assert.match(teacherPage, /nearestExpiry/, 'teacher list must render nearest expiring wallet reward copy');
assert.doesNotMatch(teacherPage, /remainingInvites|invite_quota|used_invites_count|invitesLeft|teacher\.quota/, 'teacher list must not surface old invite quota cards');

assert.match(invitePage, /data-testid="code-generation-terms-modal"/, 'invite page must block code generation behind terms modal');
assert.match(invitePage, /generatePaidMessageCode/, 'invite page must have WhatsApp-message paid code generation path');
assert.match(invitePage, /generatePaidCodeOnly/, 'invite page must have paid code-only generation path');
assert.match(invitePage, /generateFreeSharedCode/, 'invite page must have free shared tracking code generation path');
assert.match(invitePage, /fetchCurrentTerms\(templateId\)/, 'invite page must fetch template-scoped terms after instance/template is known');
assert.doesNotMatch(invitePage, /currentTerms\?\.id\s*\|\|\s*milestones\[0\]\?\.term_id/, 'invite page must not fall back to unrelated milestone term id');
assert.match(invitePage, /whatsappMessage/, 'invite page must render/copy backend WhatsApp URL+code message');
assert.match(invitePage, /notPaidProgress/, 'free shared code UI must label no paid-seat/no milestone rewards');
assert.doesNotMatch(invitePage, /remaining\s*<=\s*0/, 'code generation must not disable on old remaining-seat count');
assert.match(invitePage, /currentTerms\?\.code_generation_terms/, 'code-generation modal must show backend code_generation_terms');
assert.match(invitePage, /currentTerms\?\.reward_claim_terms/, 'reward claim modal must show backend reward_claim_terms');
assert.match(invitePage, /walletRewardLots/, 'invite page must read reward lots for wallet expiry display');
assert.match(invitePage, /nearestExpiry/, 'invite page must render nearest expiring wallet reward copy');
assert.match(invitePage, /acceptedTermId = response\?\.data\?\.term_id/, 'accepted terms response must pin generated code term id');
assert.match(invitePage, /termId: acceptedTermId/, 'access-code generation must use accepted term id, not stale current terms');
assert.doesNotMatch(invitePage, /await pendingAction\(\)/, 'terms confirmation must not run code generation without accepted term id');
assert.doesNotMatch(invitePage, /currentTerms\?\.terms_text/, 'terms modal must not read nonexistent terms_text');

assert.match(hook, /fetchTeacherMilestones/, 'hook must fetch teacher milestone timeline');
assert.match(hook, /fetchTeacherWallet/, 'hook must fetch teacher wallet');
assert.match(hook, /rewardLots/, 'hook must store teacher wallet reward lots');
assert.match(hook, /acceptCodeGenerationTerms/, 'hook must accept code-generation terms');
assert.match(hook, /createAccessCode/, 'hook must create new access codes via backend access-code API');
assert.match(hook, /claimMilestoneReward/, 'hook must call reward claim API');
assert.match(hook, /data:\s*\{\s*termsAccepted:\s*true\s*\}/, 'reward claim API call must send accepted terms as axios data payload');
assert.doesNotMatch(hook, /body:\s*\{\s*termsAccepted:\s*true\s*\}/, 'reward claim API call must not use unsupported body payload key');

for (const [localeName, locale] of [['en', en], ['ar', ar]]) {
  assert.match(locale, /milestones/, `${localeName} locale must include milestone frontend copy`);
  assert.match(locale, /wallet/, `${localeName} locale must include wallet frontend copy`);
  assert.match(locale, /notPaidProgress/, `${localeName} locale must include free-code no-paid-progress copy`);
  assert.match(locale, /termsModal/, `${localeName} locale must include terms modal copy`);
}

console.log('Phase 5 teacher frontend source contract passed');
