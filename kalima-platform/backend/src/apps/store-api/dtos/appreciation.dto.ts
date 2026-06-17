import { Transform } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from "class-validator";

const trimString = ({ value }: { value: unknown }) =>
  typeof value === "string" ? value.trim() : value;

export class CreateAppreciationCommentDto {
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  authorName: string;

  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  comment: string;
}
