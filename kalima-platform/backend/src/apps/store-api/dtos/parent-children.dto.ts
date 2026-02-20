import { IsInt, IsPositive, IsOptional } from "class-validator";

export class CreateParentChildDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  parent_user_id?: number; // for admin; parent callers will be set to auth.id in controller

  @IsInt()
  @IsPositive()
  student_user_id: number;
}

export class UpdateParentChildDto {
  @IsOptional()
  @IsInt()
  @IsPositive()
  parent_user_id?: number;

  @IsOptional()
  @IsInt()
  @IsPositive()
  student_user_id?: number;
}
