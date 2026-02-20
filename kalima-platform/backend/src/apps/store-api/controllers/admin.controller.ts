import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { userManagementService } from "../services/user-management.service";
import { AssignRoleDto, RevokeRoleDto, SetRolesDto } from "../dtos/admin.dto";
import { role_enum, portal_enum } from "../generated/prisma/client";
import { ValidationError, BadRequestError } from "../../../libs/errors";

// ============================================
// HELPER FUNCTIONS
// ============================================

async function validateDto<T extends object>(
  DtoClass: new () => T,
  body: unknown,
): Promise<T> {
  const dto = plainToInstance(DtoClass, body);
  const validationErrors = await validate(dto);

  if (validationErrors.length > 0) {
    const errors = validationErrors.flatMap((err) =>
      Object.values(err.constraints || {}),
    );
    throw new ValidationError(errors);
  }

  return dto;
}

const VALID_ROLES = Object.values(role_enum);
const VALID_PORTALS = Object.values(portal_enum);

function validateEnums(
  portal: string,
  role: string,
): { portal: portal_enum; role: role_enum } {
  if (!VALID_PORTALS.includes(portal as portal_enum)) {
    throw new BadRequestError(
      `Invalid portal "${portal}". Must be one of: ${VALID_PORTALS.join(", ")}`,
    );
  }
  if (!VALID_ROLES.includes(role as role_enum)) {
    throw new BadRequestError(
      `Invalid role "${role}". Must be one of: ${VALID_ROLES.join(", ")}`,
    );
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
        throw new BadRequestError(
          `Invalid role filter "${role}". Must be one of: ${VALID_ROLES.join(", ")}`,
        );
      }
      if (portal && !VALID_PORTALS.includes(portal as portal_enum)) {
        throw new BadRequestError(
          `Invalid portal filter "${portal}". Must be one of: ${VALID_PORTALS.join(", ")}`,
        );
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
      _next(error);
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
        throw new BadRequestError("Invalid user ID");
      }

      const user = await userManagementService.getUserWithRoles(userId);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      _next(error);
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
        throw new BadRequestError("Invalid user ID");
      }

      const dto = await validateDto(AssignRoleDto, req.body);
      const validated = validateEnums(dto.portal, dto.role);

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
      _next(error);
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
        throw new BadRequestError("Invalid user ID");
      }

      const dto = await validateDto(RevokeRoleDto, req.body);
      const validated = validateEnums(dto.portal, dto.role);

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
      _next(error);
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
        throw new BadRequestError("Invalid user ID");
      }

      const dto = await validateDto(SetRolesDto, req.body);

      // Validate all role entries
      const validatedRoles: Array<{ portal: portal_enum; role: role_enum }> =
        [];
      for (const entry of dto.roles) {
        const validated = validateEnums(entry.portal, entry.role);
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
      _next(error);
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
        throw new BadRequestError("Invalid user ID");
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
      _next(error);
    }
  },
};

export default adminController;
