import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { userManagementService } from "../services/user-management.service";
import { accountReviewService } from "../services/account-review.service";
import {
  AssignRoleDto,
  RevokeRoleDto,
  SetRolesDto,
  CreateAdminDto,
  CreateSubAdminDto,
  CreateModeratorDto,
  CreateAssistantDto,
  UpsertAccountReviewSettingsDto,
  CreateTeacherDto,
  CreateStudentDto,
  CreateParentDto,
  CreateLecturerDto,
  UpdateUserFlagDto,
} from "../dtos/admin.dto";
import { role_enum, portal_enum } from "../generated/prisma/client";
import {
  ValidationError,
  BadRequestError,
  ForbiddenError,
} from "../../../libs/errors";
import {
  TeacherRegistrationDto,
  StudentRegistrationDto,
  ParentRegistrationDto,
  LecturerRegistrationDto,
} from "../dtos/auth.dto";
import { CreatorContext } from "../interfaces/auth.interface";
import { userProfileService } from "../services/user-profile.service";
import { UpdateProfileDto } from "../dtos/user-profile.dto";

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

function canViewOrEditUserFlag(user: any): boolean {
  const roles: Array<{ role: role_enum }> = user?.roles ?? [];
  const allowedRoles: role_enum[] = [
    role_enum.Admin,
    role_enum.SubAdmin,
    role_enum.Moderator,
  ];
  return roles.some((r) => allowedRoles.includes(r.role));
}

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
  // CREATE USER (ADMIN DASHBOARD)
  // ============================================

  /**
   * POST /admin/users
   * Body must include `role` and the corresponding fields for that role.
   */
  async createUser(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const role = req.body.role;
      if (!role) {
        throw new BadRequestError("Role is required in the request body");
      }

      if (!VALID_ROLES.includes(role as role_enum)) {
        throw new BadRequestError(`Invalid role "${role}".`);
      }

      const creator: CreatorContext = {
        userId: (req as any).user.userId || (req as any).user.id,
        roles: (req as any).user.roles || [],
      };

      let result;
      switch (role as role_enum) {
        case role_enum.Admin:
          const adminDto = await validateDto(CreateAdminDto, req.body);
          result = await userManagementService.createAdmin(adminDto, creator);
          break;
        case role_enum.SubAdmin:
          const subAdminDto = await validateDto(CreateSubAdminDto, req.body);
          result = await userManagementService.createSubAdmin(
            subAdminDto,
            creator,
          );
          break;
        case role_enum.Moderator:
          const modDto = await validateDto(CreateModeratorDto, req.body);
          result = await userManagementService.createModerator(modDto, creator);
          break;
        case role_enum.Assistant:
          const assistantDto = await validateDto(CreateAssistantDto, req.body);
          result = await userManagementService.createAssistant(
            assistantDto,
            creator,
          );
          break;
        case role_enum.Teacher:
          const hasPermTeacher = creator.roles.some((r) =>
            (
              [
                role_enum.Admin,
                role_enum.SubAdmin,
                role_enum.Moderator,
              ] as role_enum[]
            ).includes(r.role),
          );
          if (!hasPermTeacher)
            throw new ForbiddenError("Not allowed to create Teacher");
          const teacherDto = await validateDto(
            TeacherRegistrationDto,
            req.body,
          );
          result = (
            await userManagementService.createTeacher(teacherDto, creator)
          ).user;
          break;
        case role_enum.Student:
          const hasPermStudent = creator.roles.some((r) =>
            (
              [
                role_enum.Admin,
                role_enum.SubAdmin,
                role_enum.Moderator,
              ] as role_enum[]
            ).includes(r.role),
          );
          if (!hasPermStudent)
            throw new ForbiddenError("Not allowed to create Student");
          const studentDto = await validateDto(
            StudentRegistrationDto,
            req.body,
          );
          result = (
            await userManagementService.createStudent(studentDto, creator)
          ).user;
          break;
        case role_enum.Parent:
          const hasPermParent = creator.roles.some((r) =>
            (
              [
                role_enum.Admin,
                role_enum.SubAdmin,
                role_enum.Moderator,
              ] as role_enum[]
            ).includes(r.role),
          );
          if (!hasPermParent)
            throw new ForbiddenError("Not allowed to create Parent");
          const parentDto = await validateDto(ParentRegistrationDto, req.body);
          result = (
            await userManagementService.createParent(parentDto, creator)
          ).user;
          break;
        case role_enum.Lecturer:
          const hasPermLecturer = creator.roles.some((r) =>
            (
              [
                role_enum.Admin,
                role_enum.SubAdmin,
                role_enum.Moderator,
              ] as role_enum[]
            ).includes(r.role),
          );
          if (!hasPermLecturer)
            throw new ForbiddenError("Not allowed to create Lecturer");
          const lecturerDto = await validateDto(
            LecturerRegistrationDto,
            req.body,
          );
          result = (
            await userManagementService.createLecturer(lecturerDto, creator)
          ).user;
          break;
        default:
          throw new BadRequestError(
            `Role ${role} creation is not supported via this endpoint.`,
          );
      }

      res.status(201).json({
        success: true,
        message: `User with role ${role} created successfully`,
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // CREATE SPECIFIC USERS (Dedicated Endpoints)
  // ============================================

  /**
   * POST /admin/teachers
   */
  async createTeacher(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateTeacherDto, req.body);
      const creator: CreatorContext = {
        userId: (req as any).user.userId || (req as any).user.id,
        roles: (req as any).user.roles || [],
      };

      const result = await userManagementService.createTeacherAsAdmin(
        dto,
        creator,
      );

      res.status(201).json({
        success: true,
        message: "Teacher created successfully",
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * POST /admin/students
   */
  async createStudent(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateStudentDto, req.body);
      const creator: CreatorContext = {
        userId: (req as any).user.userId || (req as any).user.id,
        roles: (req as any).user.roles || [],
      };

      const result = await userManagementService.createStudentAsAdmin(
        dto,
        creator,
      );

      res.status(201).json({
        success: true,
        message: "Student created successfully",
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * POST /admin/parents
   */
  async createParent(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateParentDto, req.body);
      const creator: CreatorContext = {
        userId: (req as any).user.userId || (req as any).user.id,
        roles: (req as any).user.roles || [],
      };

      const result = await userManagementService.createParentAsAdmin(
        dto,
        creator,
      );

      res.status(201).json({
        success: true,
        message: "Parent created successfully",
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * POST /admin/lecturers
   */
  async createLecturer(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(CreateLecturerDto, req.body);
      const creator: CreatorContext = {
        userId: (req as any).user.userId || (req as any).user.id,
        roles: (req as any).user.roles || [],
      };

      const result = await userManagementService.createLecturerAsAdmin(
        dto,
        creator,
      );

      res.status(201).json({
        success: true,
        message: "Lecturer created successfully",
        data: result,
      });
    } catch (error) {
      _next(error);
    }
  },

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

      const isDeleted = req.query.isDeleted
        ? req.query.isDeleted === "true"
        : undefined;

      const result = await userManagementService.listUsers({
        page,
        limit,
        search,
        role: role as role_enum | undefined,
        portal: portal as portal_enum | undefined,
        isDeleted,
        includeFlag: canViewOrEditUserFlag((req as any).user),
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

      const user = await userManagementService.getUserWithRolesByPermission(
        userId,
        canViewOrEditUserFlag((req as any).user),
      );
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // UPDATE USER PROFILE
  // ============================================

  async updateUserProfile(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const targetProfile = await userProfileService.getProfile(userId);
      const roles = (targetProfile.user_roles || []).map((r) => r.role);

      const dto = await validateDto(UpdateProfileDto, req.body);
      const updated = await userProfileService.updateProfile(
        userId,
        dto,
        roles,
      );
      res.status(200).json({
        success: true,
        message: "User profile updated successfully",
        data: updated,
      });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // UPDATE USER FLAG
  // ============================================
  /**
   * PATCH /admin/users/:userId/flag
   * Body: { flag: "NORMAL" | "PRO" | "ELITE" | ... }
   */
  async updateUserFlag(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      if (!canViewOrEditUserFlag((req as any).user)) {
        throw new ForbiddenError(
          "Only Admin, SubAdmin, or Moderator can update user flag",
        );
      }

      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const dto = await validateDto(UpdateUserFlagDto, req.body);
      const updated = await userManagementService.updateUserFlag(
        userId,
        dto.flag,
      );

      res.status(200).json({
        success: true,
        message: "User flag updated successfully",
        data: updated,
      });
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

  // ============================================
  // ACCOUNT REVIEW
  // ============================================

  /**
   * GET /admin/account-review-settings
   */
  async getAccountReviewSettings(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const settings = await accountReviewService.getAllSettings();
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * PUT /admin/account-review-settings
   * Body: { settings: [{ role, requires_review }, ...] }
   */
  async upsertAccountReviewSettings(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(UpsertAccountReviewSettingsDto, req.body);
      const adminId = (req as any).user?.userId ?? (req as any).user?.id;

      for (const entry of dto.settings) {
        await accountReviewService.upsertSetting(
          entry.role,
          entry.requires_review,
          adminId,
        );
      }

      const settings = await accountReviewService.getAllSettings();
      res.status(200).json({ success: true, data: settings });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * POST /admin/users/:userId/approve
   */
  async approveUser(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const user = await accountReviewService.approveUser(userId);
      res.status(200).json({
        success: true,
        message: "User approved",
        data: user,
      });
    } catch (error) {
      _next(error);
    }
  },

  /**
   * POST /admin/users/:userId/reject
   */
  async rejectUser(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const userId = parseInt(req.params.userId as string, 10);
      if (isNaN(userId)) {
        throw new BadRequestError("Invalid user ID");
      }

      const user = await accountReviewService.rejectUser(userId);
      res.status(200).json({
        success: true,
        message: "User rejected",
        data: user,
      });
    } catch (error) {
      _next(error);
    }
  },

  // ============================================
  // DELETE USER
  // ============================================

  /**
   * DELETE /admin/users/:userId
   * Admin/SubAdmin can delete any user except themselves.
   */
  async deleteUser(
    req: Request,
    res: Response,
    _next: NextFunction,
  ): Promise<void> {
    try {
      const callerUserId = (req as any).user?.userId;
      const targetUserId = Number(req.params.userId);

      if (isNaN(targetUserId)) {
        res.status(400).json({ success: false, message: "Invalid user ID" });
        return;
      }

      if (callerUserId === targetUserId) {
        res.status(400).json({
          success: false,
          message:
            "Cannot delete your own account via this endpoint. Use DELETE /auth/delete-account instead.",
        });
        return;
      }

      await userManagementService.deleteUser(targetUserId);
      res
        .status(200)
        .json({ success: true, message: "User deleted successfully" });
    } catch (error) {
      _next(error);
    }
  },
};

export default adminController;
