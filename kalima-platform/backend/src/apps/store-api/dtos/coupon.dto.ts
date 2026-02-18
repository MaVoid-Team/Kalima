import { Type } from "class-transformer";
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
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
  code: string;

  @IsEnum(DiscountType)
  @IsNotEmpty()
  discount_type: DiscountType;

  /** Required when discount_type is "amount" */
  @ValidateIf((o) => o.discount_type === DiscountType.AMOUNT)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  discount_amount: number;

  /** Required when discount_type is "percentage" */
  @ValidateIf((o) => o.discount_type === DiscountType.PERCENTAGE)
  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @Max(100)
  discount_percentage: number;

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
  @IsOptional()
  code?: string;

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
  @IsNotEmpty()
  @IsDate()
  @IsOptional()
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
}

export class UseCouponDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
