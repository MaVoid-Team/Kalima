import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Matches,
  ValidateIf,
} from "class-validator";

// ============================================
// ENUMS
// ============================================

export enum DiscountType {
  AMOUNT = "amount",
  PERCENTAGE = "percentage",
}

// ============================================
// CREATE COUPON DTO
// ============================================

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9-]+$/, {
    message: "code must contain only uppercase letters, numbers, and hyphens",
  })
  code: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  product_id: number;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discount_type: DiscountType;

  /** Required when discount_type is "amount" */
  @ValidateIf((o) => o.discount_type === DiscountType.AMOUNT)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Max(999999)
  discount_amount: number;

  /** Required when discount_type is "percentage" */
  @ValidateIf((o) => o.discount_type === DiscountType.PERCENTAGE)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Max(100)
  discount_percentage: number;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  starts_at?: Date;

  @Type(() => Date)
  @IsNotEmpty()
  @IsDate()
  expires_at: Date;
}

// ============================================
// UPDATE COUPON DTO
// ============================================

export class UpdateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9-]+$/, {
    message: "code must contain only uppercase letters, numbers, and hyphens",
  })
  @IsOptional()
  code?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  product_id?: number;

  @IsEnum(DiscountType)
  @IsOptional()
  discount_type?: DiscountType;

  @ValidateIf((o) => o.discount_type === DiscountType.AMOUNT)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @IsOptional()
  discount_amount?: number;

  @ValidateIf((o) => o.discount_type === DiscountType.PERCENTAGE)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Max(100)
  @IsOptional()
  discount_percentage?: number;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  starts_at?: Date;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  expires_at?: Date;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

// ============================================
// VALIDATE / USE COUPON DTOs
// ============================================

export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  product_id?: number;
}

export class UseCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}

export class getAllCouponsDto {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  limit?: number;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  product_id?: number;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  startDate?: Date;

  @Type(() => Date)
  @IsOptional()
  @IsDate()
  endDate?: Date;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  isAmount?: boolean;
}
