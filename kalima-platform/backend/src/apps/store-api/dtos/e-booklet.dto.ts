import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export enum EBookletTemplateStatusDto {
  draft = "draft",
  published = "published",
  archived = "archived",
}

export enum EBookletHotspotTypeDto {
  text = "text",
  image = "image",
  video = "video",
  audio = "audio",
}

export enum EBookletHotspotTriggerDto {
  hover = "hover",
  click = "click",
  both = "both",
}

export enum EBookletPurchaseStatusDto {
  pending = "pending",
  awaiting_payment = "awaiting_payment",
  paid = "paid",
  needs_branding_info = "needs_branding_info",
  customization_in_progress = "customization_in_progress",
  ready = "ready",
  cancelled = "cancelled",
  rejected = "rejected",
}

export class CreateEBookletTemplateDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(0)
  price!: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  cover_file_id?: number;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsEnum(EBookletTemplateStatusDto)
  status?: EBookletTemplateStatusDto;

  @IsOptional()
  @IsArray()
  tags?: string[];
}

export class UpdateEBookletTemplateDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsInt()
  cover_file_id?: number;

  @IsOptional()
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsEnum(EBookletTemplateStatusDto)
  status?: EBookletTemplateStatusDto;
}

export class UpsertEBookletHotspotDto {
  @IsInt()
  template_version_id!: number;

  @IsInt()
  @Min(1)
  page_number!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  x_percent!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  y_percent!: number;

  @IsNumber()
  @Min(0.1)
  @Max(20)
  radius_percent!: number;

  @IsEnum(EBookletHotspotTypeDto)
  type!: EBookletHotspotTypeDto;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  text_content?: string;

  @IsOptional()
  @IsInt()
  asset_file_id?: number;

  @IsOptional()
  @IsEnum(EBookletHotspotTriggerDto)
  trigger_type?: EBookletHotspotTriggerDto;

  @IsOptional()
  @IsObject()
  display_behavior?: Record<string, unknown>;
}

export class EBookletCheckoutDto {
  @IsInt()
  template_id!: number;

  @IsInt()
  template_version_id!: number;

  @IsObject()
  branding_json!: Record<string, unknown>;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  contact_whatsapp?: string;
}

export class UpdateEBookletPurchaseStatusDto {
  @IsEnum(EBookletPurchaseStatusDto)
  status!: EBookletPurchaseStatusDto;

  @IsOptional()
  @IsString()
  admin_notes?: string;
}

export class DeliverEBookletDto {
  @IsInt()
  custom_document_file_id!: number;

  @IsString()
  display_title!: string;

  @IsInt()
  @Min(0)
  invite_quota!: number;

  @IsInt()
  page_count!: number;

  @IsOptional()
  @IsArray()
  page_dimensions?: Array<{ width: number; height: number }>;
}

export class CreateEBookletInviteDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  max_uses?: number;

  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class UpdateEBookletQuotaDto {
  @IsInt()
  @Min(0)
  invite_quota!: number;
}

export class AcceptEBookletInviteDto {
  @IsString()
  token!: string;
}

export class ViewerPageRequestDto {
  @IsInt()
  @Min(1)
  page_number!: number;
}

export class EBookletVisibilityDto {
  @IsBoolean()
  visible!: boolean;
}
