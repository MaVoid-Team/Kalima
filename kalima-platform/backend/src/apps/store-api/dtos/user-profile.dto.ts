import {
  IsString,
  IsOptional,
  MaxLength,
  IsIn,
  IsInt,
  IsPositive,
  IsBoolean,
} from "class-validator";

/** PATCH /profile/me — basic + role-specific profile fields */
export class UpdateProfileDto {
  // ── Basic (all roles) ──
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  secondary_phone?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  government_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  zone_id?: number;

  // ── Teacher-specific ──
  @IsOptional()
  @IsInt()
  @IsPositive()
  subject_id?: number;

  @IsOptional()
  @IsBoolean()
  is_primary?: boolean;

  @IsOptional()
  @IsBoolean()
  is_preparatory?: boolean;

  @IsOptional()
  @IsBoolean()
  is_secondary?: boolean;

  // ── Student-specific ──
  @IsOptional()
  @IsInt()
  @IsPositive()
  level_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  faction?: string;

  // ── Student / Parent shared ──
  @IsOptional()
  @IsString()
  @MaxLength(255)
  parent_phone_number?: string;
}
