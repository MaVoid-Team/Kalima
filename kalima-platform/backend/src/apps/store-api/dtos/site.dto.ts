import { IsString, IsNotEmpty, IsOptional, MaxLength, IsBoolean } from "class-validator";

export class CreateSiteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateSiteDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
