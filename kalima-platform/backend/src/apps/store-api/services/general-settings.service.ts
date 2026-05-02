import { prisma } from "../../../libs/db/prisma";

class GeneralSettingsService {
  /** Get or create the singleton settings row (id=1) */
  async getSettings() {
    return prisma.general_settings.upsert({
      where: { id: 1 },
      create: { id: 1 },
      update: {},
    });
  }

  async updateReceivingNumber(number: string) {
    return prisma.general_settings.upsert({
      where: { id: 1 },
      create: { id: 1, whatsapp_receiving_number: number },
      update: { whatsapp_receiving_number: number, updated_at: new Date() },
    });
  }

  async updateSendingNumber(number: string | null) {
    return prisma.general_settings.upsert({
      where: { id: 1 },
      create: { id: 1, whatsapp_sending_number: number },
      update: { whatsapp_sending_number: number, updated_at: new Date() },
    });
  }
}

export const generalSettingsService = new GeneralSettingsService();
