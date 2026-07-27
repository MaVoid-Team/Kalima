jest.mock("baileys", () => ({
  __esModule: true,
  default: jest.fn(),
  useMultiFileAuthState: jest.fn(),
  DisconnectReason: {},
  makeCacheableSignalKeyStore: jest.fn(),
  proto: { Message: { create: jest.fn() } },
  fetchLatestBaileysVersion: jest.fn(),
  Browsers: { macOS: jest.fn() },
}));

import { BaileysClient } from "./client";

const callbacks = {
  onQr: jest.fn(),
  onReady: jest.fn(),
  onAuthFailure: jest.fn(),
  onDisconnected: jest.fn(),
};

describe("BaileysClient pairing lifecycle", () => {
  it("clears stale persisted credentials before starting an explicit QR pairing", async () => {
    const client = new BaileysClient();
    const destroy = jest.spyOn(client, "destroy");
    const clearAuthState = jest
      .spyOn(client as any, "clearAuthState")
      .mockResolvedValue(undefined);
    const connect = jest
      .spyOn(client as any, "connect")
      .mockResolvedValue(undefined);

    await client.startPairing(callbacks);

    expect(destroy).toHaveBeenCalledTimes(1);
    expect(clearAuthState).toHaveBeenCalledTimes(1);
    expect(connect).toHaveBeenCalledTimes(1);
    expect(clearAuthState.mock.invocationCallOrder[0]).toBeLessThan(
      connect.mock.invocationCallOrder[0],
    );
  });

  it("clears persisted credentials when logging out without an active socket", async () => {
    const client = new BaileysClient();
    const clearAuthState = jest
      .spyOn(client as any, "clearAuthState")
      .mockResolvedValue(undefined);

    await client.logout();

    expect(clearAuthState).toHaveBeenCalledTimes(1);
  });
});
