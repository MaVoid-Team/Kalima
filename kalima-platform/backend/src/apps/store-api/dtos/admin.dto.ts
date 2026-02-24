import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MinLength,
  IsEnum,
  IsInt,
  IsPositive,
  IsArray,
  IsBoolean,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { gender_enum, role_enum } from "../generated/prisma/client";

// ============================================
// ADMIN USER CREATION DTOs
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
// ROLE MANAGEMENT DTOs
// ============================================

export class AssignRoleDto {
  @IsString()
  @IsNotEmpty()
  portal: string; // portal_enum value: "store" | "academy"

  @IsString()
  @IsNotEmpty()
  role: string; // role_enum value: "Admin" | "SubAdmin" | "Teacher" | etc.
}

export class RevokeRoleDto {
  @IsString()
  @IsNotEmpty()
  portal: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

export class RoleEntryDto {
  @IsString()
  @IsNotEmpty()
  portal: string;

  @IsString()
  @IsNotEmpty()
  role: string;
}

export class SetRolesDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => RoleEntryDto)
  roles: RoleEntryDto[];
}

// ============================================
// USER LISTING / QUERY DTOs
// ============================================

export class ListUsersQueryDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  portal?: string;
}

// ============================================
// ACCOUNT REVIEW DTOs
// ============================================

export class AccountReviewSettingEntryDto {
  @IsEnum(role_enum)
  role: role_enum;

  @IsBoolean()
  requires_review: boolean;
}

export class UpsertAccountReviewSettingsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => AccountReviewSettingEntryDto)
  settings: AccountReviewSettingEntryDto[];
}
