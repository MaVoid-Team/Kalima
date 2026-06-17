import {
  IsString,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  IsBoolean,
  IsInt,
  IsPositive,
  IsIn,
} from "class-validator";

export class CreateTeachesAtDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  user_id?: number; // if omitted and caller is a teacher, controller will set to authenticated user

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location_name: string;

  @IsOptional()
  @IsIn(["School", "Center"])
  location_type?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class UpdateTeachesAtDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  user_id?: number;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  location_name?: string;

  @IsOptional()
  @IsIn(["School", "Center"])
  location_type?: string;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
