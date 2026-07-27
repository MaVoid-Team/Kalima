import test from "node:test";
import assert from "node:assert/strict";
import { canImpersonateUser } from "./impersonationPermissions.js";

const privilegedRoles = ["Admin", "SubAdmin", "Moderator"];

test("subadmins cannot impersonate accounts with any privileged role", () => {
  for (const privilegedRole of privilegedRoles) {
    assert.equal(
      canImpersonateUser({
        actorIsSubAdmin: true,
        targetRoles: ["Teacher", privilegedRole],
      }),
      false,
    );
  }
});

test("subadmins can impersonate regular users", () => {
  assert.equal(
    canImpersonateUser({
      actorIsSubAdmin: true,
      targetRoles: ["Teacher"],
    }),
    true,
  );
});

test("admins retain permission to impersonate privileged accounts", () => {
  assert.equal(
    canImpersonateUser({
      actorIsSubAdmin: false,
      targetRoles: privilegedRoles,
    }),
    true,
  );
});
