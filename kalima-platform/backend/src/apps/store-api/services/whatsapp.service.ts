import { baileysClient } from "../../../libs/whatsapp/client";
import { BadRequestError } from "../../../libs/errors";

class WhatsAppService {
  async sendMessage(phone: string, message: string): Promise<void> {
    if (baileysClient.status !== "ready") {
      throw new BadRequestError(
        "WhatsApp is not connected. Please scan the QR code first."
      );
    }
    if (!phone || !message) {
      throw new BadRequestError("Phone number and message are required");
    }
    await baileysClient.sendMessage(phone, message);
  }

  getStatus() {
    return {
      status: baileysClient.status,
      whatsapp_sending_number:
        baileysClient.status === "ready" ? baileysClient.phoneNumber : null,
    };
  }

  async logout(): Promise<void> {
    await baileysClient.logout();
  }
}

export const whatsappService = new WhatsAppService();
