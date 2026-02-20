import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested,
} from "class-validator";

// ============================================
// FIELD TYPE ENUM (mirrors prisma field_type_enum)
// ============================================

export enum FieldType {
  TEXT = "text",
  NUMBER = "number",
  DATE = "date",
  IMAGE = "image",
}

// ============================================
// FIELD DEFINITION DTOs
// ============================================

export class CreateFieldDefinitionDto {
  @IsString()
  @IsNotEmpty()
  label: string;

  @IsEnum(FieldType)
  @IsNotEmpty()
  field_type: FieldType;
}

export class UpdateFieldDefinitionDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  label?: string;

  @IsEnum(FieldType)
  @IsOptional()
  field_type?: FieldType;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  active?: boolean;
}

// ============================================
// PRODUCT FIELD ATTACHMENT DTOs
// ============================================

export class AttachFieldEntry {
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  field_definition_id: number;

  @Type(() => Boolean)
  @IsBoolean()
  @IsOptional()
  is_required?: boolean;
}

export class AttachFieldsToProductDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachFieldEntry)
  @IsNotEmpty()
  fields: AttachFieldEntry[];
}
