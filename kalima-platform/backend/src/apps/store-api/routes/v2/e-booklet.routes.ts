import { Router } from "express";
import rateLimit from "express-rate-limit";
import { eBookletController } from "../../controllers/e-booklet.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";
import { requireRole } from "../../middleware/requireRole.middleware";
import { uploadSingleImage } from "../../middleware/upload.middleware";
import { role_enum, portal_enum } from "../../generated/prisma/client";
import {
  uploadEBookletCover,
  uploadEBookletDocument,
  uploadEBookletHotspotMedia,
} from "../../middleware/e-booklet-upload.middleware";

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
  requireRole([role_enum.Student]),
];

const viewerAuth = [authenticateToken];

const inviteAcceptanceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many e-booklet invite attempts. Please try again later.",
  },
});

const viewerLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 180,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many e-booklet viewer requests. Please slow down.",
  },
});

// Store APIs - separate from normal Market products.
router.get("/e-booklet-store", eBookletController.listStoreTemplates);
router.get("/e-booklet-store/instances/:instanceId", eBookletController.getStoreTemplate);
router.post("/e-booklet-checkout", ...studentAuth, uploadSingleImage("paymentScreenshot"), eBookletController.createPublicCheckout);

// Admin APIs.
router.post(
  "/admin/e-booklet-files/document",
  ...adminAuth,
  uploadEBookletDocument,
  eBookletController.uploadFileAsset,
);
router.post(
  "/admin/e-booklet-files/cover",
  ...adminAuth,
  uploadEBookletCover,
  eBookletController.uploadFileAsset,
);
router.post(
  "/admin/e-booklet-files/hotspot-media",
  ...adminAuth,
  uploadEBookletHotspotMedia,
  eBookletController.uploadFileAsset,
);
router.get(
  "/admin/e-booklet-files/:assetId/preview",
  ...adminAuth,
  eBookletController.previewAdminFileAsset,
);
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
router.get(
  "/admin/e-booklet-templates/:id/versions",
  ...adminAuth,
  eBookletController.listTemplateVersions,
);
router.patch(
  "/admin/e-booklet-template-versions/:versionId",
  ...adminAuth,
  eBookletController.updateVersion,
);
router.get(
  "/admin/e-booklet-template-versions/:versionId/hotspots",
  ...adminAuth,
  eBookletController.listVersionHotspots,
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
router.post(
  "/admin/e-booklet-purchases",
  ...adminAuth,
  eBookletController.createPurchaseDeal,
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
router.get(
  "/admin/e-booklet-instances/:instanceId/students",
  ...adminAuth,
  eBookletController.listInstanceStudents,
);
router.get(
  "/admin/e-booklet-instances/:instanceId/users/:userId/devices",
  ...adminAuth,
  eBookletController.listViewerDevices,
);
router.post(
  "/admin/e-booklet-instances/:instanceId/users/:userId/devices/reset",
  ...adminAuth,
  eBookletController.resetViewerDevices,
);
router.post(
  "/admin/e-booklet-instances/:instanceId/users/:userId/device-allowance",
  ...adminAuth,
  eBookletController.addDeviceAllowance,
);
router.post(
  "/admin/e-booklet-student-purchases/:purchaseId/approve",
  ...adminAuth,
  eBookletController.approveStudentPurchaseLink,
);
router.get(
  "/admin/e-booklet-analytics",
  ...adminAuth,
  eBookletController.adminAnalytics,
);
router.get(
  "/admin/e-booklet-analytics.csv",
  ...adminAuth,
  eBookletController.exportAdminAnalyticsCsv,
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
router.get(
  "/teacher/e-booklet-analytics",
  ...teacherAuth,
  eBookletController.teacherAnalytics,
);

// Student APIs.
router.get("/student/e-booklets", ...studentAuth, eBookletController.listStudentEBooklets);
router.get(
  "/e-booklet-invites/:token/open",
  inviteAcceptanceLimiter,
  eBookletController.recordInviteOpen,
);
router.post(
  "/e-booklet-invites/:token/accept",
  inviteAcceptanceLimiter,
  ...studentAuth,
  uploadSingleImage("paymentScreenshot"),
  eBookletController.acceptInvite,
);

// Admin View Mode APIs.
router.get(
  "/admin/e-booklet-viewer/:instanceId/metadata",
  viewerLimiter,
  ...adminAuth,
  eBookletController.getAdminViewerMetadata,
);
router.get(
  "/admin/e-booklet-viewer/:instanceId/pages/:pageNumber",
  viewerLimiter,
  ...adminAuth,
  eBookletController.getAdminViewerPage,
);
router.get(
  "/admin/e-booklet-viewer/:instanceId/pages/:pageNumber/hotspots",
  viewerLimiter,
  ...adminAuth,
  eBookletController.getAdminViewerPageHotspots,
);
router.get(
  "/admin/e-booklet-viewer/hotspots/:hotspotId/content",
  viewerLimiter,
  ...adminAuth,
  eBookletController.getAdminHotspotContent,
);
router.get(
  "/admin/e-booklet-viewer/hotspots/:hotspotId/assets/:assetId",
  viewerLimiter,
  ...adminAuth,
  eBookletController.getAdminAuthorizedHotspotAsset,
);

// Viewer APIs.
router.get(
  "/e-booklet-viewer/:instanceId/metadata",
  viewerLimiter,
  ...viewerAuth,
  eBookletController.getViewerMetadata,
);
router.post(
  "/e-booklet-viewer/:instanceId/devices/bind",
  viewerLimiter,
  ...viewerAuth,
  eBookletController.bindViewerDevice,
);
router.get(
  "/e-booklet-viewer/:instanceId/pages/:pageNumber",
  viewerLimiter,
  ...viewerAuth,
  eBookletController.getViewerPage,
);
router.get(
  "/e-booklet-viewer/:instanceId/pages/:pageNumber/hotspots",
  viewerLimiter,
  ...viewerAuth,
  eBookletController.getViewerPageHotspots,
);
router.get(
  "/e-booklet-viewer/hotspots/:hotspotId/content",
  viewerLimiter,
  ...viewerAuth,
  eBookletController.getHotspotContent,
);
router.get(
  "/e-booklet-viewer/hotspots/:hotspotId/assets/:assetId",
  viewerLimiter,
  ...viewerAuth,
  eBookletController.getAuthorizedHotspotAsset,
);

export default router;
