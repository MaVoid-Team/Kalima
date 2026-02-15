import { Request, Response, NextFunction } from 'express';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { authService } from '../services/auth.service.new';
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
  CreateAdminDto,
  CreateSubAdminDto,
  CreateModeratorDto,
  CreateAssistantDto,
} from '../dtos/auth.dto';
import { CreatorContext } from '../interfaces/auth.interface';
import { auth_provider_enum } from '../../generated/prisma';

// ============================================
// HELPER FUNCTIONS
// ============================================

async function validateDto<T extends object>(
  DtoClass: new () => T,
  body: unknown
): Promise<{ dto: T | null; errors: string[] }> {
  const dto = plainToInstance(DtoClass, body);
  const validationErrors = await validate(dto);

  if (validationErrors.length > 0) {
    const errors = validationErrors.flatMap((err) =>
      Object.values(err.constraints || {})
    );
    return { dto: null, errors };
  }

  return { dto, errors: [] };
}

function handleError(res: Response, error: unknown, statusCode = 400): void {
  const message = error instanceof Error ? error.message : 'An error occurred';
  res.status(statusCode).json({ success: false, message });
}

function getIpAddress(req: Request): string | undefined {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
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

  async registerTeacher(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(TeacherRegistrationDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.registerTeacher(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async registerStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(StudentRegistrationDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.registerStudent(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async registerParent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(ParentRegistrationDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.registerParent(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async registerLecturer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(LecturerRegistrationDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.registerLecturer(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // REGISTRATION - Firebase OAuth
  // ============================================

  async registerTeacherFirebase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(TeacherFirebaseRegistrationDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.registerTeacherFirebase(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async registerStudentFirebase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(StudentFirebaseRegistrationDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.registerStudentFirebase(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async registerParentFirebase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(ParentFirebaseRegistrationDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.registerParentFirebase(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async registerLecturerFirebase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(LecturerFirebaseRegistrationDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.registerLecturerFirebase(dto);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // LOGIN
  // ============================================

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(LoginDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.login(dto);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error, 401);
    }
  },

  async loginFirebase(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(FirebaseLoginDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.loginFirebase(dto.idToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error, 401);
    }
  },

  // ============================================
  // TOKEN MANAGEMENT
  // ============================================

  async refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(RefreshTokenDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.refresh(dto.refreshToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error, 401);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(LogoutDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      await authService.logout(dto.refreshToken);
      res.status(200).json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      handleError(res, error);
    }
  },

  async logoutAllDevices(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      await authService.logoutAllDevices(userId);
      res.status(200).json({ success: true, message: 'Logged out from all devices' });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // PASSWORD MANAGEMENT
  // ============================================

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(ForgotPasswordDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.forgotPassword(dto.email);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(ResetPasswordDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const ipAddress = getIpAddress(req);
      const result = await authService.resetPassword(dto.token, dto.newPassword, ipAddress);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { dto, errors } = await validateDto(ChangePasswordDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const ipAddress = getIpAddress(req);
      const result = await authService.changePassword(userId, dto, ipAddress);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async setPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { dto, errors } = await validateDto(SetPasswordDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.setPassword(userId, dto);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // EMAIL VERIFICATION
  // ============================================

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(VerifyEmailDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.verifyEmail(dto.token);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async resendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { dto, errors } = await validateDto(ResendVerificationEmailDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.resendVerificationEmail(dto.email);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async sendVerificationEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await authService.sendVerificationEmail(userId);
      res.status(200).json({ success: true, ...result });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // ACCOUNT LINKING
  // ============================================

  async linkFirebaseAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { dto, errors } = await validateDto(LinkFirebaseAccountDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.linkFirebaseAccount(userId, dto.idToken);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async unlinkProvider(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { dto, errors } = await validateDto(UnlinkProviderDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const provider = dto.provider as auth_provider_enum;
      const result = await authService.unlinkProvider(userId, provider);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  async getLinkedProviders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const result = await authService.getLinkedProviders(userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error);
    }
  },

  // ============================================
  // ADMIN USER CREATION
  // ============================================

  async createAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { dto, errors } = await validateDto(CreateAdminDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.createAdmin(dto, creator);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error, 403);
    }
  },

  async createSubAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { dto, errors } = await validateDto(CreateSubAdminDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.createSubAdmin(dto, creator);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error, 403);
    }
  },

  async createModerator(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { dto, errors } = await validateDto(CreateModeratorDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.createModerator(dto, creator);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error, 403);
    }
  },

  async createAssistant(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const creator = (req as any).user as CreatorContext;
      if (!creator) {
        res.status(401).json({ success: false, message: 'Unauthorized' });
        return;
      }

      const { dto, errors } = await validateDto(CreateAssistantDto, req.body);
      if (!dto) {
        res.status(400).json({ success: false, errors });
        return;
      }

      const result = await authService.createAssistant(dto, creator);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      handleError(res, error, 403);
    }
  },
};

export default authController;
