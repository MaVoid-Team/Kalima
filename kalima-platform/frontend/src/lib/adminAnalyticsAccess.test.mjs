import test from 'node:test';
import assert from 'node:assert/strict';

import { canAccessAdminAnalytics } from './adminAnalyticsAccess.js';

test('allows an Admin to access the main analytics page', () => {
  assert.equal(canAccessAdminAnalytics(['Admin']), true);
});

test('denies every non-admin role access to the main analytics page', () => {
  for (const roles of [['SubAdmin'], ['Moderator'], ['Assistant'], ['Teacher'], []]) {
    assert.equal(canAccessAdminAnalytics(roles), false);
  }
});
