import { Router } from "express";
import { eBookletController } from "../../controllers/e-booklet.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { role_enum, portal_enum } from "../../generated/prisma/client";

const router = Router();

const adminAuth = [
  authenticateToken,
  requireRole([role_enum.Admin, role_enum.SubAdmin, role_enum.Moderator]),
];

const teacherAuth = [
  authenticateToken,
  requireRole([role_enum.Teacher], portal_enum.store),
];

const studentAuth = [
  authenticateToken,
  requireRole([role_enum.Student], portal_enum.store),
];

const viewerAuth = [authenticateToken];

// Store APIs - separate from normal Market products.
router.get("/e-booklet-store", eBookletController.listStoreTemplates);
router.get("/e-booklet-store/:slug", eBookletController.getStoreTemplate);
router.post("/e-booklet-checkout", ...teacherAuth, eBookletController.checkout);

// Admin APIs.
router.get(
  "/admin/e-booklet-templates",
  ...adminAuth,
  eBookletController.listAdminTemplates,
);
router.post(
  "/admin/e-booklet-templates",
  ...adminAuth,
  eBookletController.createTemplate,
);
router.get(
  "/admin/e-booklet-templates/:id",
  ...adminAuth,
  eBookletController.getAdminTemplate,
);
router.patch(
  "/admin/e-booklet-templates/:id",
  ...adminAuth,
  eBookletController.updateTemplate,
);
router.delete(
  "/admin/e-booklet-templates/:id",
  ...adminAuth,
  eBookletController.updateTemplate,
);
router.post(
  "/admin/e-booklet-templates/:id/versions",
  ...adminAuth,
  eBookletController.createVersion,
);
router.post(
  "/admin/e-booklet-template-versions/:versionId/publish",
  ...adminAuth,
  eBookletController.publishVersion,
);
router.post(
  "/admin/e-booklet-template-versions/:versionId/hotspots",
  ...adminAuth,
  eBookletController.createHotspot,
);
router.patch(
  "/admin/e-booklet-hotspots/:hotspotId",
  ...adminAuth,
  eBookletController.updateHotspot,
);
router.delete(
  "/admin/e-booklet-hotspots/:hotspotId",
  ...adminAuth,
  eBookletController.deleteHotspot,
);
router.get(
  "/admin/e-booklet-purchases",
  ...adminAuth,
  eBookletController.listPurchases,
);
router.get(
  "/admin/e-booklet-purchases/:id",
  ...adminAuth,
  eBookletController.getPurchase,
);
router.patch(
  "/admin/e-booklet-purchases/:id/status",
  ...adminAuth,
  eBookletController.updatePurchaseStatus,
);
router.post(
  "/admin/e-booklet-purchases/:id/mark-paid",
  ...adminAuth,
  eBookletController.markPurchasePaid,
);
router.post(
  "/admin/e-booklet-purchases/:id/deliver",
  ...adminAuth,
  eBookletController.deliverPurchase,
);
router.get(
  "/admin/e-booklet-instances",
  ...adminAuth,
  eBookletController.listInstances,
);
router.post(
  "/admin/e-booklet-instances/:id/update-quota",
  ...adminAuth,
  eBookletController.updateQuota,
);
router.post(
  "/admin/e-booklet-instances/:id/revoke-access",
  ...adminAuth,
  eBookletController.revokeTeacherAccess,
);

// Teacher APIs.
router.get("/teacher/e-booklets", ...teacherAuth, eBookletController.listTeacherEBooklets);
router.get(
  "/teacher/e-booklets/:instanceId/invites",
  ...teacherAuth,
  eBookletController.listInvites,
);
router.post(
  "/teacher/e-booklets/:instanceId/invites",
  ...teacherAuth,
  eBookletController.createInvite,
);
router.patch(
  "/teacher/e-booklet-invites/:inviteId/disable",
  ...teacherAuth,
  eBookletController.disableInvite,
);
router.get(
  "/teacher/e-booklets/:instanceId/students",
  ...teacherAuth,
  eBookletController.listInstanceStudents,
);
router.patch(
  "/teacher/e-booklets/:instanceId/students/:studentId/revoke",
  ...teacherAuth,
  eBookletController.revokeStudentAccess,
);

// Student APIs.
router.get("/student/e-booklets", ...studentAuth, eBookletController.listStudentEBooklets);
router.post(
  "/e-booklet-invites/:token/accept",
  ...studentAuth,
  eBookletController.acceptInvite,
);

// Viewer APIs.
router.get(
  "/e-booklet-viewer/:instanceId/metadata",
  ...viewerAuth,
  eBookletController.getViewerMetadata,
);
router.get(
  "/e-booklet-viewer/:instanceId/pages/:pageNumber",
  ...viewerAuth,
  eBookletController.getViewerPage,
);
router.get(
  "/e-booklet-viewer/:instanceId/pages/:pageNumber/hotspots",
  ...viewerAuth,
  eBookletController.getViewerPageHotspots,
);
router.get(
  "/e-booklet-viewer/hotspots/:hotspotId/content",
  ...viewerAuth,
  eBookletController.getHotspotContent,
);

export default router;
