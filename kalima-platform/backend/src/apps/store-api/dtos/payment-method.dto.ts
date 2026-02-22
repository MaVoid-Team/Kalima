import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from "class-validator";

export class CreatePaymentMethodDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone_number!: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsInt()
  @IsOptional()
  image_id?: number;
}

export class UpdatePaymentMethodDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsInt()
  @IsOptional()
  image_id?: number;
}
