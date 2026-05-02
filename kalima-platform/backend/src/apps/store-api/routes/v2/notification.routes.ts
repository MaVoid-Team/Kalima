import { Router } from "express";
import { notificationController } from "../../controllers/notification.controller";
import { authenticateToken } from "../../../../libs/auth/middleware";

const router = Router();

// All notification endpoints require authentication
// ---------------------------------------------------------------

/**
 * GET /notifications/my/unread-count
 * Must be defined BEFORE /notifications/:id/read to avoid route conflict.
 */
router.get(
  "/my/unread-count",
  authenticateToken,
  notificationController.getUnreadCount,
);

/**
 * GET /notifications/my
 * Returns the authenticated user's notifications (paginated).
 */
router.get("/my", authenticateToken, notificationController.getMyNotifications);

/**
 * PATCH /notifications/read-all
 * Mark all notifications as read.
 * Must be defined BEFORE /:id/read to avoid route conflict.
 */
router.patch(
  "/read-all",
  authenticateToken,
  notificationController.markAllAsRead,
);

/**
 * PATCH /notifications/:id/read
 * Mark a single notification as read.
 */
router.patch(
  "/:id/read",
  authenticateToken,
  notificationController.markAsRead,
);

export default router;
