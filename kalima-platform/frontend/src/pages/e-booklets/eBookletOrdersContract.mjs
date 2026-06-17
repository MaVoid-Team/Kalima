export const E_BOOKLET_ORDERS_ROUTE = "/e-booklet-orders";
export const E_BOOKLET_STORE_ROUTE = "/e-booklets";
export const E_BOOKLET_TEACHER_LIBRARY_ROUTE = "/teacher/e-booklets";

export const E_BOOKLET_ORDERS_ALLOWED_ROLES = ["Teacher"];

export const E_BOOKLET_ORDER_STATUSES = [
  "pending",
  "awaiting_payment",
  "paid",
  "needs_branding_info",
  "customization_in_progress",
  "ready",
  "rejected",
  "cancelled",
  "unknown",
];

export const E_BOOKLET_ORDERS_NAV_CONTRACT = Object.freeze({
  route: E_BOOKLET_ORDERS_ROUTE,
  storefrontRoute: E_BOOKLET_STORE_ROUTE,
  teacherLibraryRoute: E_BOOKLET_TEACHER_LIBRARY_ROUTE,
  allowedRoles: E_BOOKLET_ORDERS_ALLOWED_ROLES,
  visibleInNavbarForTeacher: true,
  visibleInTeacherSidebar: true,
  visibleInStudentSidebar: false,
  studentAccessModel: "private-url-or-access-code",
});
