import { Request, Response, NextFunction } from "express";
import { role_enum, portal_enum } from "../generated/prisma/client";
import { UnauthorizedError, ForbiddenError } from "../../../libs/errors";

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
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user) {
      return next(new UnauthorizedError());
    }

    const roles: Array<{ portal: string; role: string }> = user.roles ?? [];

    if (!roles.length) {
      return next(new ForbiddenError("Forbidden: No roles assigned"));
    }

    const hasPermission = roles.some((r) => {
      const roleMatch = allowedRoles.includes(r.role as role_enum);
      const portalMatch = portal ? r.portal === portal : true;
      return roleMatch && portalMatch;
    });

    if (!hasPermission) {
      return next(
        new ForbiddenError(
          `Forbidden: Requires one of [${allowedRoles.join(", ")}]`,
        ),
      );
    }

    next();
  };
}
