import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { authService } from "../services/auth.service";
import { notificationService } from "../services/notification.service";
import {
  TeacherRegistrationDto,
  StudentRegistrationDto,
  ParentRegistrationDto,
  LecturerRegistrationDto,
  TeacherFirebaseRegistrationDto,
  StudentFirebaseRegistrationDto,
  ParentFirebaseRegistrationDto,
  LecturerFirebaseRegistrationDto,
  LoginDto,
  FirebaseLoginDto,
  RefreshTokenDto,
  LogoutDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
  SetPasswordDto,
  VerifyEmailDto,
  ResendVerificationEmailDto,
  LinkFirebaseAccountDto,
  UnlinkProviderDto,
  StartImpersonationDto,
} from "../dtos/auth.dto";
import {
  CreateAdminDto,
  CreateSubAdminDto,
  CreateModeratorDto,
  CreateAssistantDto,
} from "../dtos/admin.dto";
import { CreatorContext } from "../interfaces/auth.interface";
import { auth_provider_enum } from "../generated/prisma/client";
import { ValidationError, UnauthorizedError } from "../../../libs/errors";

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
      Object.values(err.constraints || {}).map((message) => ({
        field: err.property,
        message,
      })),
    );
    throw new ValidationError(errors);
  }

  return dto;
}

function getIpAddress(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress;
}

// ============================================
// AUTH CONTROLLER
// ============================================

export const authController = {
  // ============================================
  // REGISTRATION - Local
  // ============================================

  async registerTeacher(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(TeacherRegistrationDto, req.body);
      const result = await authService.registerTeacher(dto);
      const io = req.app.get("io");
      notificationService.notifyAdminsOfNewAccount(io, result.user);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async registerStudent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(StudentRegistrationDto, req.body);
      const result = await authService.registerStudent(dto);
      const io = req.app.get("io");
      notificationService.notifyAdminsOfNewAccount(io, result.user);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async registerParent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(ParentRegistrationDto, req.body);
      const result = await authService.registerParent(dto);
      const io = req.app.get("io");
      notificationService.notifyAdminsOfNewAccount(io, result.user);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async registerLecturer(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(LecturerRegistrationDto, req.body);
      const result = await authService.registerLecturer(dto);
      const io = req.app.get("io");
      notificationService.notifyAdminsOfNewAccount(io, result.user);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // REGISTRATION - Firebase OAuth
  // ============================================

  async registerTeacherFirebase(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(TeacherFirebaseRegistrationDto, req.body);
      const result = await authService.registerTeacherFirebase(dto);
      const io = req.app.get("io");
      notificationService.notifyAdminsOfNewAccount(io, result.user);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async registerStudentFirebase(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(StudentFirebaseRegistrationDto, req.body);
      const result = await authService.registerStudentFirebase(dto);
      const io = req.app.get("io");
      notificationService.notifyAdminsOfNewAccount(io, result.user);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async registerParentFirebase(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(ParentFirebaseRegistrationDto, req.body);
      const result = await authService.registerParentFirebase(dto);
      const io = req.app.get("io");
      notificationService.notifyAdminsOfNewAccount(io, result.user);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async registerLecturerFirebase(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(LecturerFirebaseRegistrationDto, req.body);
      const result = await authService.registerLecturerFirebase(dto);
      const io = req.app.get("io");
      notificationService.notifyAdminsOfNewAccount(io, result.user);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // LOGIN
  // ============================================

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(LoginDto, req.body);
      const result = await authService.login(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async loginFirebase(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(FirebaseLoginDto, req.body);
      const result = await authService.loginFirebase(dto.idToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  async refresh(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(RefreshTokenDto, req.body);
      const result = await authService.refresh(dto.refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const dto = await validateDto(LogoutDto, req.body);
      await authService.logout(dto.refreshToken);
      res
        .status(200)
        .json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  },

  async logoutAllDevices(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      await authService.logoutAllDevices(userId);
      res
        .status(200)
        .json({ success: true, message: "Logged out from all devices" });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // PASSWORD MANAGEMENT
  // ============================================

  async forgotPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(ForgotPasswordDto, req.body);
      const result = await authService.forgotPassword(dto.email);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async resetPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(ResetPasswordDto, req.body);
      const ipAddress = getIpAddress(req);
      const result = await authService.resetPassword(
        dto.token,
        dto.newPassword,
        ipAddress,
      );
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async changePassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const dto = await validateDto(ChangePasswordDto, req.body);
      const ipAddress = getIpAddress(req);
      const result = await authService.changePassword(userId, dto, ipAddress);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async setPassword(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const dto = await validateDto(SetPasswordDto, req.body);
      const result = await authService.setPassword(userId, dto);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  async verifyEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(VerifyEmailDto, req.body);
      const result = await authService.verifyEmail(dto.token);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async resendVerificationEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const dto = await validateDto(ResendVerificationEmailDto, req.body);
      const result = await authService.resendVerificationEmail(dto.email);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  async sendVerificationEmail(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const result = await authService.sendVerificationEmail(userId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // ACCOUNT LINKING
  // ============================================

  async linkFirebaseAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const dto = await validateDto(LinkFirebaseAccountDto, req.body);
      const result = await authService.linkFirebaseAccount(userId, dto.idToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async unlinkProvider(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const dto = await validateDto(UnlinkProviderDto, req.body);
      const provider = dto.provider as auth_provider_enum;
      const result = await authService.unlinkProvider(userId, provider);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async getLinkedProviders(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const result = await authService.getLinkedProviders(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // ACCOUNT DELETION
  // ============================================

  async deleteAccount(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        throw new UnauthorizedError();
      }

      const result = await authService.deleteAccount(userId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // IMPERSONATION
  // ============================================

  async startImpersonation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        throw new UnauthorizedError();
      }

      const dto = await validateDto(StartImpersonationDto, req.body);
      const result = await authService.startImpersonation(
        creator,
        dto.targetUserId,
      );
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async stopImpersonation(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        throw new UnauthorizedError();
      }

      const result = await authService.stopImpersonation(creator);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  },

  // ============================================
  // ADMIN USER CREATION
  // ============================================

  async createAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        throw new UnauthorizedError();
      }

      const dto = await validateDto(CreateAdminDto, req.body);
      const result = await authService.createAdmin(dto, creator);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async createSubAdmin(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        throw new UnauthorizedError();
      }

      const dto = await validateDto(CreateSubAdminDto, req.body);
      const result = await authService.createSubAdmin(dto, creator);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async createModerator(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        throw new UnauthorizedError();
      }

      const dto = await validateDto(CreateModeratorDto, req.body);
      const result = await authService.createModerator(dto, creator);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async createAssistant(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        throw new UnauthorizedError();
      }

      const dto = await validateDto(CreateAssistantDto, req.body);
      const result = await authService.createAssistant(dto, creator);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },
};

export default authController;
