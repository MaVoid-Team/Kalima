import { EventEmitter } from "events";
import fs from "fs/promises";
import os from "os";
import path from "path";

const sockets: Array<{
  ev: EventEmitter;
  end: jest.Mock;
  logout: jest.Mock;
  sendMessage: jest.Mock;
  user: { id: string };
}> = [];

const makeWASocket = jest.fn(() => {
  const socket = {
    ev: new EventEmitter(),
    end: jest.fn(),
    logout: jest.fn().mockResolvedValue(undefined),
    sendMessage: jest.fn().mockResolvedValue(undefined),
    user: { id: "201000000000:1@s.whatsapp.net" },
  };
  sockets.push(socket);
  return socket;
});

jest.mock("baileys", () => ({
  __esModule: true,
  default: (...args: unknown[]) => makeWASocket(...args),
  useMultiFileAuthState: jest.fn().mockResolvedValue({
    state: { creds: {}, keys: {} },
    saveCreds: jest.fn(),
  }),
  DisconnectReason: {
    loggedOut: 401,
    restartRequired: 515,
  },
  makeCacheableSignalKeyStore: jest.fn((keys) => keys),
  fetchLatestBaileysVersion: jest.fn().mockResolvedValue({ version: [2, 3000, 1] }),
  Browsers: { macOS: jest.fn(() => ["Desktop", "macOS", "1"]) },
  proto: { Message: { create: jest.fn(() => ({})) } },
}));

import { BaileysClient } from "./client";

function callbacks() {
  return {
    onQr: jest.fn(),
    onReady: jest.fn(),
    onAuthFailure: jest.fn(),
    onDisconnected: jest.fn(),
    onStatusChange: jest.fn(),
  };
}

describe("BaileysClient lifecycle", () => {
  let authDir: string;

  beforeEach(async () => {
    jest.clearAllMocks();
    sockets.length = 0;
    authDir = await fs.mkdtemp(path.join(os.tmpdir(), "kalima-wa-"));
  });

  afterEach(async () => {
    jest.useRealTimers();
    await fs.rm(authDir, { recursive: true, force: true });
  });

  it("restores a saved session during startup without creating competing clients", async () => {
    await fs.writeFile(path.join(authDir, "creds.json"), "{}");
    const client = new BaileysClient({ authDir, reconnectDelaysMs: [1] });
    const events = callbacks();

    const restored = await client.restore(events);
    const duplicate = client.initialize(events);
    await duplicate;

    expect(restored).toBe(true);
    expect(makeWASocket).toHaveBeenCalledTimes(1);
    expect(client.status).toBe("initializing");
  });

  it("serializes concurrent QR initialization requests", async () => {
    const client = new BaileysClient({ authDir, reconnectDelaysMs: [1] });
    const events = callbacks();

    await Promise.all([
      client.initialize(events),
      client.initialize(events),
      client.initialize(events),
    ]);

    expect(makeWASocket).toHaveBeenCalledTimes(1);
    expect(client.status).toBe("initializing");
  });

  it("clears stale credentials before starting an explicit QR pairing", async () => {
    await fs.writeFile(path.join(authDir, "creds.json"), "{}");
    const client = new BaileysClient({ authDir, reconnectDelaysMs: [1] });
    const events = callbacks();
    await client.restore(events);

    await client.startPairing(events);

    await expect(fs.access(path.join(authDir, "creds.json"))).rejects.toBeDefined();
    expect(makeWASocket).toHaveBeenCalledTimes(2);
    expect(sockets[0].end).toHaveBeenCalledTimes(1);
    expect(client.status).toBe("initializing");
  });

  it("reconnects after a transient close without deleting saved credentials", async () => {
    await fs.writeFile(path.join(authDir, "creds.json"), "{}");
    const client = new BaileysClient({ authDir, reconnectDelaysMs: [1] });
    const events = callbacks();
    await client.restore(events);

    sockets[0].ev.emit("connection.update", {
      connection: "close",
      lastDisconnect: { error: new Error("network unavailable") },
    });
    await Promise.resolve();

    expect(client.status).toBe("reconnecting");
    expect(await fs.stat(path.join(authDir, "creds.json"))).toBeDefined();

    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(makeWASocket).toHaveBeenCalledTimes(2);
  });

  it("clears credentials and never reconnects after intentional logout", async () => {
    await fs.writeFile(path.join(authDir, "creds.json"), "{}");
    const client = new BaileysClient({ authDir, reconnectDelaysMs: [1] });
    const events = callbacks();
    await client.restore(events);

    await client.logout();
    sockets[0].ev.emit("connection.update", {
      connection: "close",
      lastDisconnect: { error: new Error("socket closed") },
    });
    await new Promise((resolve) => setTimeout(resolve, 10));

    await expect(fs.access(path.join(authDir, "creds.json"))).rejects.toBeDefined();
    await expect(fs.access(authDir)).resolves.toBeUndefined();
    expect(client.status).toBe("disconnected");
    expect(makeWASocket).toHaveBeenCalledTimes(1);
    expect(events.onDisconnected).toHaveBeenCalledWith("logout");
  });

  it("clears stale credentials when logging out without an active socket", async () => {
    await fs.writeFile(path.join(authDir, "creds.json"), "{}");
    const client = new BaileysClient({ authDir, reconnectDelaysMs: [1] });

    await client.logout();

    await expect(fs.access(path.join(authDir, "creds.json"))).rejects.toBeDefined();
    await expect(fs.access(authDir)).resolves.toBeUndefined();
    expect(client.status).toBe("disconnected");
  });
});
