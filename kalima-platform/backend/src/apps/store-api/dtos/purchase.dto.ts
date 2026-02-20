import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  MaxLength,
} from "class-validator";
import { Type } from "class-transformer";

export class PurchaseItemRequiredFieldDto {
  @IsInt()
  @IsPositive()
  field_definition_id: number;

  @IsString()
  @MaxLength(1000)
  value: string;
}

export class CreatePurchaseItemDto {
  @IsInt()
  @IsPositive()
  product_id: number;

  @IsNumber()
  price_at_purchase: number;

  @IsNumber()
  discount: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PurchaseItemRequiredFieldDto)
  required_fields?: PurchaseItemRequiredFieldDto[];
}

export class CreatePurchaseDto {
  @IsInt()
  @IsPositive()
  user_id: number;

  @IsInt()
  @IsPositive()
  payment_method_id: number;

  @IsInt()
  @IsPositive()
  payment_screenshot_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items: CreatePurchaseItemDto[];

  @IsNumber()
  subtotal: number;

  @IsNumber()
  discount: number;

  @IsNumber()
  total: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  number_transferred_from?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  payment_number?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}
