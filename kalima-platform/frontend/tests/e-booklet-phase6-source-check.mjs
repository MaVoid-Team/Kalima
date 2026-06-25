import fs from 'node:fs';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = (path) => fs.readFileSync(new URL(path, root), 'utf8');

const app = read('src/App.jsx');
const sidebar = read('src/components/admin/Sidebar.jsx');
const hook = read('src/hooks/admin/useAdminEBooklets.js');
const page = read('src/pages/admin/e-booklets/AdminEBookletTermsMilestonesPage.jsx');
const en = read('src/locales/en/eBooklets.json');
const ar = read('src/locales/ar/eBooklets.json');
const backendRead = (path) => fs.readFileSync(new URL(`../backend/${path}`, root), 'utf8');
const backendRoutes = backendRead('src/apps/store-api/routes/v2/e-booklet.routes.ts');
const backendController = backendRead('src/apps/store-api/controllers/e-booklet.controller.ts');
const milestoneService = backendRead('src/apps/store-api/services/e-booklet-milestone.service.ts');
const prismaSchema = backendRead('src/apps/store-api/prisma/schema.prisma');
const migration = backendRead('src/apps/store-api/prisma/migrations/20260614180000_e_booklet_terms_milestones_wallet/migration.sql');
const rewardExpiryMigration = backendRead('src/apps/store-api/prisma/migrations/20260625143000_teacher_wallet_reward_expiry/migration.sql');

assert.match(app, /AdminEBookletTermsMilestonesPage/, 'admin terms/milestones page must be lazy loaded');
assert.match(app, /\/admin\/e-booklet-terms-milestones/, 'admin terms/milestones route must be registered');
assert.match(sidebar, /eBookletTermsMilestones/, 'admin sidebar must expose terms/milestones navigation');
assert.match(sidebar, /\/admin\/e-booklet-terms-milestones/, 'sidebar link must route to terms/milestones admin page');

assert.match(hook, /useAdminEBookletTermsMilestones/, 'admin hook must expose terms/milestones workflow');
assert.match(hook, /\/admin\/e-booklet-terms\b/, 'hook must list/create/update terms via backend terms endpoint');
assert.match(hook, /\/admin\/e-booklet-terms\/\$\{termId\}\/activate/, 'hook must call set-active terms endpoint');
assert.match(hook, /\/admin\/e-booklet-milestones\b/, 'hook must create/update milestones via backend milestone endpoint');
assert.match(hook, /\/admin\/e-booklet-milestones\/reorder/, 'hook must call milestone reorder endpoint');
assert.match(hook, /\/admin\/e-booklet-progress/, 'hook must load achievement/claim progress status');
assert.doesNotMatch(hook, /\/teacher\/e-booklet-milestones/, 'admin hook must not use teacher milestone listing endpoint');

assert.match(backendRoutes, /const adminManagerAuth[\s\S]*role_enum\.Admin[\s\S]*role_enum\.SubAdmin/, 'backend must define Admin/SubAdmin-only manager auth for terms/milestones');
assert.match(backendRoutes, /"\/admin\/e-booklet-milestones"[\s\S]*\.\.\.adminManagerAuth[\s\S]*eBookletController\.listMilestones/, 'admin milestone list route must use manager auth');
assert.match(backendController, /listMilestones\([\s\S]*isAdminRoute[\s\S]*listMilestones\([\s\S]*isAdminRoute \? undefined : currentUserId\(req\)[\s\S]*isAdminRoute/, 'admin milestone listing must be unscoped and include inactive rows while teacher listing remains teacher-scoped');
assert.match(milestoneService, /includeInactive = false/, 'milestone service must default to active-only milestone listing');
assert.match(milestoneService, /includeInactive \? \{\} : \{ active: true \}/, 'milestone service must allow admin listing inactive milestones');
assert.match(milestoneService, /notification_recipients/, 'milestone service must persist notification recipient setting');
assert.match(prismaSchema, /notification_recipients\s+String/, 'Prisma schema must persist notification recipients');
assert.match(prismaSchema, /reward_expiry_days\s+Int\s+@default\(120\)/, 'Prisma schema must persist milestone reward expiry days');
assert.match(prismaSchema, /model teacher_wallet_credit_lots/, 'Prisma schema must track wallet reward credit lots');
assert.match(migration, /"notification_recipients" VARCHAR\(50\) NOT NULL DEFAULT 'admins'/, 'migration must create persisted notification recipients column');
assert.match(rewardExpiryMigration, /"reward_expiry_days" INTEGER NOT NULL DEFAULT 120/, 'reward expiry migration must default milestone reward expiry to 120 days');
assert.match(rewardExpiryMigration, /CREATE TABLE "teacher_wallet_credit_lots"/, 'reward expiry migration must create wallet credit lots table');

assert.match(page, /data-testid="admin-e-booklet-terms-table"/, 'page must render admin terms table');
assert.match(page, /data-testid="admin-e-booklet-term-form"/, 'page must render create/edit term form');
assert.match(page, /data-testid="admin-e-booklet-set-active-term"/, 'page must expose set-active action');
assert.match(page, /data-testid="admin-e-booklet-milestones-table"/, 'page must render milestones table');
assert.match(page, /data-testid="admin-e-booklet-milestone-form"/, 'page must render milestone create/edit form');
assert.match(page, /data-testid="admin-e-booklet-reorder-milestones"/, 'page must expose milestone reorder action');
assert.match(page, /targetPaidRedemptions/, 'milestone form must include paid redemption target');
assert.match(page, /milestonePrice/, 'milestone form must include pricing rule/tier field');
assert.match(page, /codeGenerationTerms/, 'term form must include code-generation policy field');
assert.match(page, /rewardClaimTerms/, 'term form must include reward-claim policy field');
assert.match(page, /notificationRecipients/, 'page must include notification settings/recipients field');
assert.match(page, /rewardEnabled/, 'page must include reward enabled/disabled control');
assert.match(page, /data-testid="admin-e-booklet-reward-enabled"/, 'page must render a real reward-enabled checkbox control');
assert.match(page, /checked=\{milestoneForm\.rewardEnabled\}/, 'reward-enabled control must bind to milestone form state');
assert.match(page, /onCheckedChange=\{\(value\) => updateMilestoneField\("rewardEnabled", Boolean\(value\)\)\}/, 'reward-enabled control must update milestone form state');
assert.match(page, /rewardAmountSnapshot: milestoneForm\.rewardEnabled \? Number\(milestoneForm\.rewardAmountSnapshot \|\| 0\) : 0/, 'disabled rewards must submit an explicit zero reward amount');
assert.match(page, /rewardExpiryDays/, 'milestone form must include reward expiry days');
assert.match(page, /rewardExpiryDays: Number\(milestoneForm\.rewardExpiryDays \|\| 120\)/, 'milestone form must submit reward expiry days with 120 day default');
assert.match(page, /disabled=\{!milestoneForm\.rewardEnabled\}/, 'reward amount input must be disabled when rewards are disabled');
assert.match(milestoneService, /rewardAmountSnapshot[\s\S]*nonNegativeNumber/, 'backend create milestone contract must accept zero reward amount');
assert.match(milestoneService, /data\.reward_amount_snapshot[\s\S]*nonNegativeNumber/, 'backend update milestone contract must accept zero reward amount');
assert.match(milestoneService, /rewardExpiryDays[\s\S]*reward_expiry_days/, 'backend milestone contract must accept reward expiry days');
assert.doesNotMatch(milestoneService, /rewardAmountSnapshot[\s\S]{0,120}positiveNumber/, 'backend create milestone contract must not reject zero reward amount');
assert.match(migration, /"reward_amount_snapshot" IS NOT NULL AND "reward_amount_snapshot" >= 0/, 'DB milestone reward constraint must allow explicit zero reward amount');
assert.match(migration, /"reward_amount" >= 0/, 'DB achievement reward constraint must allow zero rewards generated from disabled milestones');
assert.doesNotMatch(migration, /"reward_amount_snapshot" > 0|"reward_amount" > 0/, 'DB reward constraints must not require positive reward amounts');
assert.match(page, /data-testid="admin-e-booklet-progress-view"/, 'page must render achievement/claim status view');
assert.match(page, /editingTerm\?\.status === "active"/, 'active terms edit form must detect active terms');
assert.match(page, /delete payload\.status/, 'editing active terms must not PATCH status active through update endpoint');
assert.match(page, /disabled=\{editingTerm\?\.status === "active"\}/, 'active terms status select must be disabled');
assert.doesNotMatch(page, /motivationalMessage|motivational_message|motivation/i, 'admin UI must not add admin-authored motivational message field');

for (const [localeName, locale] of [['en', en], ['ar', ar]]) {
  assert.match(locale, /termsMilestones/, `${localeName} locale must include terms/milestones admin copy`);
  assert.match(locale, /notificationRecipients/, `${localeName} locale must include notification-recipient copy`);
  assert.match(locale, /rewardEnabled/, `${localeName} locale must include reward-enabled copy`);
  assert.match(locale, /rewardExpiryDays/, `${localeName} locale must include reward-expiry-days copy`);
}

console.log('Phase 6 admin frontend source contract passed');
