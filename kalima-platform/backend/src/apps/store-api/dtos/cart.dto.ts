// Data Transfer Objects for Cart operations
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
  IsNotEmpty,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateCartDto {
  @IsInt()
  @IsPositive()
  user_id: number;
}

export class AddCartItemDto {
  @IsInt()
  @IsPositive()
  product_id: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemRequiredFieldDto)
  required_fields?: CartItemRequiredFieldDto[];

  // For file upload, handled separately (e.g., Multer)
}

export class CartItemRequiredFieldDto {
  @IsInt()
  @IsPositive()
  required_field_definition_id: number;

  @IsString()
  @MaxLength(255)
  value: string;
}

export class UpdateCartItemDto {
  @IsInt()
  @IsPositive()
  cart_item_id: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;
}

export class CheckoutDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  payment_method_id: number;

  @IsString()
  @IsNotEmpty()
  numberTransferredFrom: string;

  // @IsOptional()
  // @IsString()
  // nameOnBook?: string;

  // @IsOptional()
  // @IsString()
  // numberOnBook?: string;

  // @IsOptional()
  // @IsString()
  // seriesName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemRequiredFieldDto)
  required_fields?: CartItemRequiredFieldDto[];

  // Add more fields as needed for checkout (e.g., address)
}

// DTO for fast buy (checkout single item directly)
export class FastBuyDto extends CheckoutDto {
  @IsInt()
  @IsPositive()
  product_id: number;

  @IsInt()
  @IsPositive()
  @Min(1)
  quantity: number;
}

// DTO for updating required fields of a cart item

export class UpdateCartItemRequiredFieldsDto {
  @IsInt()
  @IsPositive()
  cart_item_id: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CartItemRequiredFieldDto)
  required_fields: CartItemRequiredFieldDto[];
}
