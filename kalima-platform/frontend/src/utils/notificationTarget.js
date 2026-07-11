const legacyNotificationTargetResolvers = [
  { pattern: /^\/orders\/([^/?]+)([?].*)?$/, resolve: ([, id, search = ""]) => `/admin/orders/${id}${search}` },
  { pattern: /^\/users\/([^/?]+)([?].*)?$/, resolve: ([, id, search = ""]) => `/admin/users/${id}${search}` },
  { pattern: /^\/teacher\/e-booklets\/milestones\/[^/?]+(?:[?].*)?$/, resolve: () => "/teacher/e-booklets" },
  { pattern: /^\/admin\/e-booklets\/milestones\/[^/?]+(?:[?].*)?$/, resolve: () => "/admin/e-booklets/settings/terms-milestones" },
  { pattern: /^\/admin\/e-booklets\/access-codes([?].*)?$/, resolve: ([, search = ""]) => `/admin/e-booklets/access${search}` },
];

export function normalizeNotificationTarget(targetLink) {
  if (!targetLink) return null;
  for (const { pattern, resolve } of legacyNotificationTargetResolvers) {
    const match = targetLink.match(pattern);
    if (match) return resolve(match);
  }
  return targetLink;
}

export function getNotificationTarget(notification, { hasAdminAccess, isTeacher }) {
  if (notification.target_link) return normalizeNotificationTarget(notification.target_link);
  if (notification.entity_type !== "purchase") return null;
  if (hasAdminAccess) return `/admin/orders/${notification.entity_id}`;
  return isTeacher ? "/teacher/orders" : "/orders";
}
