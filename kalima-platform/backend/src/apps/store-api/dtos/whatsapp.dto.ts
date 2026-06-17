import { IsString, IsNotEmpty } from "class-validator";

export class UpdateReceivingNumberDto {
  @IsString()
  @IsNotEmpty()
  whatsapp_receiving_number!: string;
}

export class SendWhatsappMessageDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;
}
