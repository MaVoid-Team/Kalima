import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, IsPositive, IsBoolean } from "class-validator";

export class CreateZoneDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsInt()
  @IsPositive()
  government_id: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateZoneDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  government_id?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
