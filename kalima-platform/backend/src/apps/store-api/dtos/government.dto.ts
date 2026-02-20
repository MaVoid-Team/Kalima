import { IsString, IsNotEmpty, IsOptional, MaxLength, IsBoolean } from "class-validator";

export class CreateGovernmentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateGovernmentDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
