import { Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from "class-validator";

// ============================================
// CREATE CATEGORY DTO
// ============================================

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  parent_id?: number;
}

// ============================================
// UPDATE CATEGORY DTO
// ============================================

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  parent_id?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
