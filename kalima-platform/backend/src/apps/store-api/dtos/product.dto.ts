import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
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

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  coupon_id?: number;

  /**
   * Array of category IDs to attach on creation.
   * Sent as JSON string in multipart form data.
   */
  @IsArray()
  @IsInt({ each: true })
  @IsPositive({ each: true })
  @IsOptional()
  @Type(() => Number)
  category_ids?: number[];
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

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  coupon_id?: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_archived?: boolean;
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
