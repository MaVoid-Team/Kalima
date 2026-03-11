import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

// ============================================
// PRODUCT TYPE ENUM
// ============================================

export enum ProductType {
  Book = "Book",
  Product = "Product",
}

// ============================================
// CREATE PRODUCT DTO
// ============================================

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price_after_discount?: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  serial?: string;

  @IsString()
  @IsOptional()
  sample_url?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  sample_section_id?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  sample_id?: number;

  /**
   * Category ID to attach on creation.
   * Sent as string in multipart form data.
   */
  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  category_id?: number;

  /** ISO date string – exact minute of scheduled release. Null = immediately available. */
  @IsDateString()
  @IsOptional()
  release_at?: string;

  @IsString()
  @IsOptional()
  perks?: string;
}

// ============================================
// UPDATE PRODUCT DTO
// ============================================

export class UpdateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(ProductType)
  @IsOptional()
  type?: ProductType;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price?: number;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @IsOptional()
  price_after_discount?: number;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  serial?: string;

  @IsString()
  @IsOptional()
  sample_url?: string;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  sample_section_id?: number;

  @IsInt()
  @IsPositive()
  @IsOptional()
  @Type(() => Number)
  sample_id?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_archived?: boolean;

  /** ISO date string – exact minute of scheduled release. Null = immediately available. */
  @IsDateString()
  @IsOptional()
  release_at?: string;

  @IsString()
  @IsOptional()
  perks?: string;
}

export class UpdateProductRequiredFieldDto {
  @Type(() => Boolean)
  @IsBoolean()
  is_required: boolean;
}

// ============================================
// GALLERY ENTRY UPDATE DTO
// ============================================

export class UpdateGalleryEntryDto {
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
// ATTACH CATEGORIES DTO
// ============================================

export class AttachCategoriesDto {
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @Type(() => Number)
  category_ids: number[];
}

// ============================================
// ATTACH REQUIRED FIELDS DTO
// ============================================

export class AttachRequiredFieldEntry {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  field_definition_id: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_required?: boolean;
}

export class AttachRequiredFieldsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachRequiredFieldEntry)
  fields: AttachRequiredFieldEntry[];
}

// ============================================
// ADD EXTERNAL VIDEO DTO
// ============================================

export class AddExternalVideoDto {
  @IsString()
  @IsNotEmpty()
  url: string;
}
