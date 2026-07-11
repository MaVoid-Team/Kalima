import test from "node:test";
import assert from "node:assert/strict";
import { getNotificationTarget, normalizeNotificationTarget } from "./notificationTarget.js";

test("normalizes legacy admin notification destinations", () => {
  assert.equal(normalizeNotificationTarget("/orders/42"), "/admin/orders/42");
  assert.equal(normalizeNotificationTarget("/users/9"), "/admin/users/9");
  assert.equal(normalizeNotificationTarget("/admin/e-booklets/access-codes?teacherId=3"), "/admin/e-booklets/access?teacherId=3");
});

test("keeps current targets and derives a valid admin purchase target", () => {
  assert.equal(normalizeNotificationTarget("/admin/orders/42"), "/admin/orders/42");
  assert.equal(getNotificationTarget({ entity_type: "purchase", entity_id: 42 }, { hasAdminAccess: true, isTeacher: false }), "/admin/orders/42");
});
