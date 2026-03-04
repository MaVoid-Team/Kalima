import { IsString, IsNotEmpty, IsOptional, MaxLength, IsInt, IsPositive, IsBoolean } from "class-validator";

export class CreateSocialMediaDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  teacher_user_id?: number; // if omitted and caller is a teacher, will default to authenticated user

  @IsOptional()
  @IsInt()
  @IsPositive()
  site_id?: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  url: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateSocialMediaDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  teacher_user_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  site_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  url?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
