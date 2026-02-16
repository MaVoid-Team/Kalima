import { Request, Response, NextFunction } from "express";
import { role_enum, portal_enum } from "../generated/prisma";

/**
 * Middleware that checks if the authenticated user has one of the required roles
 * in at least one of the specified portals. Must be used AFTER authenticateToken.
 *
 * @param allowedRoles - Array of role_enum values that are allowed
 * @param portal - Optional portal to check. If omitted, any portal counts.
 *
 * Usage:
 *   router.get('/admin/users', authenticateToken, requireRole([role_enum.Admin]), handler);
 *   router.get('/admin/users', authenticateToken, requireRole([role_enum.Admin, role_enum.SubAdmin]), handler);
 *   router.get('/admin/users', authenticateToken, requireRole([role_enum.Admin], portal_enum.store), handler);
 */
export function requireRole(allowedRoles: role_enum[], portal?: portal_enum) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const roles: Array<{ portal: string; role: string }> = user.roles ?? [];

    if (!roles.length) {
      res
        .status(403)
        .json({ success: false, message: "Forbidden: No roles assigned" });
      return;
    }

    const hasPermission = roles.some((r) => {
      const roleMatch = allowedRoles.includes(r.role as role_enum);
      const portalMatch = portal ? r.portal === portal : true;
      return roleMatch && portalMatch;
    });

    if (!hasPermission) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of [${allowedRoles.join(", ")}]`,
      });
      return;
    }

    next();
  };
}
