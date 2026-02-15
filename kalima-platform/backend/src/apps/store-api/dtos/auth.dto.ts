import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MinLength,
  IsEnum,
  IsInt,
  IsBoolean,
  IsPositive,
} from 'class-validator';
import { gender_enum } from '../../generated/prisma';

// ============================================
// BASE DTOs
// ============================================

export class BaseUserRegistrationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  secondary_phone?: string;

  @IsEnum(gender_enum)
  @IsNotEmpty()
  gender: gender_enum;
}

// Base DTO for Firebase OAuth registration (no password required)
export class BaseFirebaseRegistrationDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  secondary_phone?: string;

  @IsEnum(gender_enum)
  @IsNotEmpty()
  gender: gender_enum;
}

// ============================================
// MAIN USER REGISTRATION DTOs (Local)
// ============================================

export class TeacherRegistrationDto extends BaseUserRegistrationDto {
  @IsBoolean()
  @IsNotEmpty()
  is_primary: boolean;

  @IsBoolean()
  @IsNotEmpty()
  is_preparatory: boolean;

  @IsBoolean()
  @IsNotEmpty()
  is_secondary: boolean;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  government_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  zone_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  subject_id: number;
}

export class StudentRegistrationDto extends BaseUserRegistrationDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  level_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  government_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  zone_id: number;

  @IsString()
  @IsNotEmpty()
  parent_phone_number: string;

  @IsString()
  @IsOptional()
  faction?: string;
}

export class ParentRegistrationDto extends BaseUserRegistrationDto {
  // Parent only needs base user fields
  // government_id and zone_id are optional and not required during registration
}

export class LecturerRegistrationDto extends BaseUserRegistrationDto {
  // Bio and expertise are optional and can be filled later
  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  expertise?: string;
}

// ============================================
// MAIN USER REGISTRATION DTOs (Firebase OAuth)
// ============================================

export class TeacherFirebaseRegistrationDto extends BaseFirebaseRegistrationDto {
  @IsBoolean()
  @IsNotEmpty()
  is_primary: boolean;

  @IsBoolean()
  @IsNotEmpty()
  is_preparatory: boolean;

  @IsBoolean()
  @IsNotEmpty()
  is_secondary: boolean;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  government_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  zone_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  subject_id: number;
}

export class StudentFirebaseRegistrationDto extends BaseFirebaseRegistrationDto {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  level_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  government_id: number;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  zone_id: number;

  @IsString()
  @IsNotEmpty()
  parent_phone_number: string;

  @IsString()
  @IsOptional()
  faction?: string;
}

export class ParentFirebaseRegistrationDto extends BaseFirebaseRegistrationDto {
  // Parent only needs base fields from Firebase registration
}

export class LecturerFirebaseRegistrationDto extends BaseFirebaseRegistrationDto {
  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  expertise?: string;
}

// ============================================
// NON-MAIN USER CREATION DTOs (Admin creates these)
// ============================================

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  secondary_phone?: string;

  @IsEnum(gender_enum)
  @IsNotEmpty()
  gender: gender_enum;
}

export class CreateSubAdminDto extends CreateAdminDto {
  // Same fields as admin
}

export class CreateModeratorDto extends CreateAdminDto {
  // Same fields as admin
}

export class CreateAssistantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  secondary_phone?: string;

  @IsEnum(gender_enum)
  @IsNotEmpty()
  gender: gender_enum;

  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  lecturer_user_id: number;
}

// ============================================
// LOGIN DTOs
// ============================================

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class FirebaseLoginDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

// ============================================
// TOKEN DTOs
// ============================================

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

// ============================================
// PASSWORD DTOs
// ============================================

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  token: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  currentPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

export class SetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

// ============================================
// FIREBASE ACCOUNT LINKING DTOs
// ============================================

export class LinkFirebaseAccountDto {
  @IsString()
  @IsNotEmpty()
  idToken: string;
}

export class UnlinkProviderDto {
  @IsString()
  @IsNotEmpty()
  provider: 'firebase' | 'google' | 'facebook';
}

// ============================================
// EMAIL VERIFICATION DTOs
// ============================================

export class VerifyEmailDto {
  @IsString()
  @IsNotEmpty()
  token: string;
}

export class ResendVerificationEmailDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
