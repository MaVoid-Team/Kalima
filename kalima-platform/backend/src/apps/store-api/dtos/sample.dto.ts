import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { sample_media_type_enum } from "../generated/prisma/client";

// ============================================
// SAMPLE SECTION DTOs
// ============================================

export class CreateSampleSectionDto {
  @IsString()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  sort_order?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

export class UpdateSampleSectionDto {
  @IsString()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  sort_order?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

// ============================================
// SAMPLE DTOs (for JSON body when creating sample)
// ============================================

export class CreateSampleBodyDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  product_id: number;

  @IsEnum(sample_media_type_enum)
  @IsOptional()
  media_type?: sample_media_type_enum;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;
}

export class UpdateSampleBodyDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  product_id?: number;

  @IsEnum(sample_media_type_enum)
  @IsOptional()
  media_type?: sample_media_type_enum;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;
}
