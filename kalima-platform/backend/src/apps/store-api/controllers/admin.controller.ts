import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { userManagementService } from "../services/user-management.service";
import { AssignRoleDto, RevokeRoleDto, SetRolesDto } from "../dtos/admin.dto";
import { role_enum, portal_enum } from "../generated/prisma";

// ============================================
// HELPER FUNCTIONS
// ============================================

async function validateDto<T extends object>(
  DtoClass: new () => T,
  body: unknown,
): Promise<{ dto: T | null; errors: string[] }> {
  const dto = plainToInstance(DtoClass, body);
  const validationErrors = await validate(dto);

  if (validationErrors.length > 0) {
    const errors = validationErrors.flatMap((err) =>
      Object.values(err.constraints || {}),
    );
    return { dto: null, errors };
  }

  return { dto, errors: [] };
}

function handleError(res: Response, error: unknown, statusCode = 400): void {
  const message = error instanceof Error ? error.message : "An error occurred";
  res.status(statusCode).json({ success: false, message });
}

const VALID_ROLES = Object.values(role_enum);
const VALID_PORTALS = Object.values(portal_enum);

function validateEnums(
  portal: string,
  role: string,
  res: Response,
): { portal: portal_enum; role: role_enum } | null {
  if (!VALID_PORTALS.includes(portal as portal_enum)) {
    res.status(400).json({
      success: false,
      message: `Invalid portal "${portal}". Must be one of: ${VALID_PORTALS.join(", ")}`,
    });
    return null;
  }
  if (!VALID_ROLES.includes(role as role_enum)) {
    res.status(400).json({
      success: false,
      message: `Invalid role "${role}". Must be one of: ${VALID_ROLES.join(", ")}`,
    });
    return null;
  }
  return { portal: portal as portal_enum, role: role as role_enum };
}

// ============================================
// ADMIN CONTROLLER
// ============================================

export const adminController = {
  // ============================================
  // LIST / SEARCH USERS
  // ============================================

  /**
   * GET /admin/users?page=1&limit=20&search=john&role=Teacher&portal=store
   */
  async listUsers(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const page = req.query.page
        ? parseInt(req.query.page as string, 10)
        : undefined;
      const limit = req.query.limit
        ? parseInt(req.query.limit as string, 10)
        : undefined;
      const search = req.query.search as string | undefined;
      const role = req.query.role as string | undefined;
      const portal = req.query.portal as string | undefined;

      // Validate role/portal enums if provided
      if (role && !VALID_ROLES.includes(role as role_enum)) {
        res.status(400).json({
          success: false,
          message: `Invalid role filter "${role}". Must be one of: ${VALID_ROLES.join(", ")}`,
        });
        return;
      }
      if (portal && !VALID_PORTALS.includes(portal as portal_enum)) {
        res.status(400).json({
          success: false,
          message: `Invalid portal filter "${portal}". Must be one of: ${VALID_PORTALS.join(", ")}`,
        });
        return;
      }

      const result = await userManagementService.listUsers({
        page,
        limit,
        search,
        role: role as role_enum | undefined,
        portal: portal as portal_enum | undefined,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // GET SINGLE USER WITH ROLES
  // ============================================

  /**
   * GET /admin/users/:userId
   */
  async getUser(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
        return;
      }

      const user = await userManagementService.getUserWithRoles(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      handleError(
        res,
        error,
        error instanceof Error && error.message === "User not found"
          ? 404
          : 400,
      );
    }
  },

  // ============================================
  // ASSIGN ROLE
  // ============================================

  /**
   * POST /admin/users/:userId/roles
   * Body: { portal: "store", role: "Teacher" }
   */
  async assignRole(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
        return;
      }

      const { dto, errors } = await validateDto(AssignRoleDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const validated = validateEnums(dto.portal, dto.role, res);
      if (!validated) return;

      const result = await userManagementService.assignRole(
        userId,
        validated.portal,
        validated.role,
      );

      res.status(201).json({
        success: true,
        message: `Role ${validated.role} on portal ${validated.portal} assigned to user ${userId}`,
        data: result,
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // REVOKE ROLE
  // ============================================

  /**
   * DELETE /admin/users/:userId/roles
   * Body: { portal: "store", role: "Teacher" }
   */
  async revokeRole(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
        return;
      }

      const { dto, errors } = await validateDto(RevokeRoleDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const validated = validateEnums(dto.portal, dto.role, res);
      if (!validated) return;

      const result = await userManagementService.revokeRole(
        userId,
        validated.portal,
        validated.role,
      );

      res.status(200).json({
        success: true,
        message: `Role ${validated.role} on portal ${validated.portal} revoked from user ${userId}`,
        data: result,
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // SET ROLES (Replace All)
  // ============================================

  /**
   * PUT /admin/users/:userId/roles
   * Body: { roles: [{ portal: "store", role: "Teacher" }, { portal: "academy", role: "Teacher" }] }
   */
  async setRoles(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
        return;
      }

      const { dto, errors } = await validateDto(SetRolesDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      // Validate all role entries
      const validatedRoles: Array<{ portal: portal_enum; role: role_enum }> =
        [];
      for (const entry of dto.roles) {
        const validated = validateEnums(entry.portal, entry.role, res);
        if (!validated) return;
        validatedRoles.push(validated);
      }

      const result = await userManagementService.setRoles(
        userId,
        validatedRoles,
      );

      res.status(200).json({
        success: true,
        message: `Roles updated for user ${userId}`,
        data: result,
      });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // GET USER ROLES
  // ============================================

  /**
   * GET /admin/users/:userId/roles
   */
  async getUserRoles(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
        return;
      }

      const user = await userManagementService.getUserWithRoles(userId);

      res.status(200).json({
        success: true,
        data: {
          userId: user.id,
          name: user.name,
          roles: user.user_roles,
        },
      });
    } catch (error) {
      handleError(
        res,
        error,
        error instanceof Error && error.message === "User not found"
          ? 404
          : 400,
      );
    }
  },
};

export default adminController;
