const PRIVILEGED_ROLES = new Set(["Admin", "SubAdmin", "Moderator"]);

export function canImpersonateUser({ actorIsSubAdmin, targetRoles = [] }) {
  if (!actorIsSubAdmin) return true;

  return !targetRoles.some((role) => PRIVILEGED_ROLES.has(role));
}
