import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { notificationService } from "../services/notification.service";
import { NotificationFilterDto } from "../dtos/notification.dto";
import { BadRequestError, ValidationError } from "../../../libs/errors";
import type { role_enum } from "../generated/prisma/client";

// ---------------------------------------------------------------
// Helper: extract user roles from JWT payload attached by middleware
// ---------------------------------------------------------------
function extractRoles(req: Request): role_enum[] {
  const roles: Array<{ role: string }> = (req as any).user?.roles ?? [];
  return roles.map((r) => r.role as role_enum);
}

async function validateDto<T extends object>(
  DtoClass: new () => T,
  source: unknown,
): Promise<T> {
  const dto = plainToInstance(DtoClass, source);
  const errors = await validate(dto as object);
  if (errors.length > 0) {
    const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
    throw new ValidationError(msgs);
  }
  return dto;
}

// ---------------------------------------------------------------
// Notification controller — customer-facing
// ---------------------------------------------------------------
export const notificationController = {
  /**
   * GET /notifications/my
   * Returns the authenticated user's notifications (own + role-based), paginated.
   */
  async getMyNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: number = (req as any).user.userId;
      const userRoles = extractRoles(req);

      const dto = await validateDto(NotificationFilterDto, req.query);

      const result = await notificationService.getByUser(userId, userRoles, {
        category: dto.category,
        is_read: dto.is_read,
        page: dto.page,
        limit: dto.limit,
      });

      res.status(200).json({
        success: true,
        results: result.notifications.length,
        pagination: {
          total: result.total,
          page: result.page,
          pages: result.pages,
          limit: result.limit,
        },
        data: { notifications: result.notifications },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /notifications/my/unread-count
   * Returns the count of unread notifications for the authenticated user.
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: number = (req as any).user.userId;
      const userRoles = extractRoles(req);

      const count = await notificationService.getUnreadCount(userId, userRoles);
      res.status(200).json({ success: true, data: { unread_count: count } });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /notifications/:id/read
   * Mark a single notification as read.
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: number = (req as any).user.userId;
      const userRoles = extractRoles(req);

      const id = parseInt(String(req.params.id), 10);
      if (isNaN(id) || id <= 0) throw new BadRequestError("Invalid notification ID");

      const updated = await notificationService.markAsRead(id, userId, userRoles);
      if (!updated) throw new BadRequestError("Notification not found or does not belong to you");

      res.status(200).json({ success: true, message: "Notification marked as read" });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /notifications/read-all
   * Mark all notifications as read for the authenticated user.
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId: number = (req as any).user.userId;
      const userRoles = extractRoles(req);

      const count = await notificationService.markAllAsRead(userId, userRoles);
      res.status(200).json({
        success: true,
        message: `Marked ${count} notification(s) as read`,
        data: { updated_count: count },
      });
    } catch (err) {
      next(err);
    }
  },
};
