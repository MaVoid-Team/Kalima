import { Request, Response, NextFunction } from "express";
import { validate } from "class-validator";
import { plainToInstance } from "class-transformer";
import { generalSettingsService } from "../services/general-settings.service";
import { whatsappService } from "../services/whatsapp.service";
import {
  UpdateReceivingNumberDto,
  SendWhatsappMessageDto,
} from "../dtos/whatsapp.dto";
import { ValidationError } from "../../../libs/errors";

async function validateDto<T extends object>(
  DtoClass: new () => T,
  body: unknown,
): Promise<T> {
  const dto = plainToInstance(DtoClass, body);
  const errors = await validate(dto);
  if (errors.length > 0) {
    const msgs = errors.flatMap((e) => Object.values(e.constraints || {}));
    throw new ValidationError(msgs);
  }
  return dto;
}

export const whatsappController = {
  /** GET /settings/contact */
  async getPublicContact(
    _req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    try {
      const settings = await generalSettingsService.getSettings();
      res.json({
        success: true,
        data: {
          whatsapp: settings.whatsapp_receiving_number,
          whatsapp_number: settings.whatsapp_receiving_number,
        },
      });
    } catch (err) { next(err); }
  },

  /** GET /admin/general-settings */
  async getGeneralSettings(
    _req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    try {
      const settings = await generalSettingsService.getSettings();
      res.json({
        success: true,
        data: {
          whatsapp_sending_number: settings.whatsapp_sending_number,
          whatsapp_receiving_number: settings.whatsapp_receiving_number,
        },
      });
    } catch (err) { next(err); }
  },

  /** PUT /admin/general-settings/whatsapp_receiving_number */
  async updateReceivingNumber(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    try {
      const dto = await validateDto(UpdateReceivingNumberDto, req.body);
      const settings = await generalSettingsService.updateReceivingNumber(
        dto.whatsapp_receiving_number
      );
      res.json({
        success: true,
        message: "Receiving number updated",
        data: {
          whatsapp_receiving_number: settings.whatsapp_receiving_number,
        },
      });
    } catch (err) { next(err); }
  },

  /** POST /admin/whatsapp/send */
  async sendMessage(
    req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    try {
      const dto = await validateDto(SendWhatsappMessageDto, req.body);
      await whatsappService.sendMessage(dto.phone, dto.message);
      res.json({ success: true, message: "Message sent" });
    } catch (err) { next(err); }
  },

  /** GET /admin/whatsapp/status */
  async getStatus(
    _req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    try {
      res.json({ success: true, data: whatsappService.getStatus() });
    } catch (err) { next(err); }
  },

  /** POST /admin/whatsapp/logout */
  async logout(
    _req: Request, res: Response, next: NextFunction
  ): Promise<void> {
    try {
      await whatsappService.logout();
      await generalSettingsService.updateSendingNumber(null);
      res.json({ success: true, message: "WhatsApp session cleared" });
    } catch (err) { next(err); }
  },
};
