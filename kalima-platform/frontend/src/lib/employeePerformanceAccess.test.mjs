import test from 'node:test';
import assert from 'node:assert/strict';

import { canAccessEmployeePerformance } from './employeePerformanceAccess.js';

test('allows an Admin to access Employee Performance', () => {
  assert.equal(canAccessEmployeePerformance(['Admin']), true);
});

test('denies every non-admin role access to Employee Performance', () => {
  for (const roles of [['SubAdmin'], ['Moderator'], ['Teacher'], []]) {
    assert.equal(canAccessEmployeePerformance(roles), false);
  }
});
