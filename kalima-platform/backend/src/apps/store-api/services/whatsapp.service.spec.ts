jest.mock("../../../libs/whatsapp/client", () => ({
  baileysClient: {
    status: "qr_pending",
    phoneNumber: null,
    qrCode: "test-qr-value",
    sendMessage: jest.fn(),
    logout: jest.fn(),
  },
}));

import { whatsappService } from "./whatsapp.service";

describe("whatsappService.getStatus", () => {
  it("includes the current QR so clients that missed the socket event can recover", () => {
    expect(whatsappService.getStatus()).toEqual({
      status: "qr_pending",
      whatsapp_sending_number: null,
      qr: "test-qr-value",
    });
  });
});
