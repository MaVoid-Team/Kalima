import {
  IsString,
  IsOptional,
  MaxLength,
  IsIn,
  IsInt,
  IsPositive,
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
  @IsIn(["male", "female"])
  gender?: string;

  // ── Teacher-specific ──
  @IsOptional()
  @IsInt()
  @IsPositive()
  subject_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  government_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  zone_id?: number;

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
