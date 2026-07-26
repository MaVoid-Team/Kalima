import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  WASocket,
  proto,
  fetchLatestBaileysVersion,
  Browsers,
} from "baileys";
import { Boom } from "@hapi/boom";
import P from "pino";
import path from "path";
import fs from "fs/promises";

export const AUTH_DIR = process.env.WHATSAPP_AUTH_DIR
  ? path.resolve(process.env.WHATSAPP_AUTH_DIR)
  : path.join(process.cwd(), "baileys_auth");
const CREDS_FILE = path.join(AUTH_DIR, "creds.json");
const RECONNECT_DELAY_MS = 2_000;
const logger = P({ level: "silent" }); // suppress Baileys internal logs

// Suppress libsignal "Closing session" noise which bypasses Pino logger
const originalConsoleLog = console.log;
console.log = function (...args: any[]) {
  if (typeof args[0] === "string" && args[0].startsWith("Closing session:")) return;
  originalConsoleLog.apply(console, args);
};

type BaileysCallbacks = {
  onQr: (qr: string) => void;
  onReady: (phoneNumber: string) => void;
  onAuthFailure: (reason: string) => void;
  onDisconnected: (reason: string) => void;
};

class BaileysClient {
  private sock: WASocket | null = null;
  private callbacks: BaileysCallbacks | null = null;
  private _status: "disconnected" | "qr_pending" | "ready" = "disconnected";
  private _phoneNumber: string | null = null;
  private _qrCode: string | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  get status() { return this._status; }
  get phoneNumber() { return this._phoneNumber; }
  get qrCode() { return this._qrCode; }

  async initialize(callbacks: BaileysCallbacks): Promise<void> {
    // Prevent double-init
    if (this.sock) {
      this.destroy();
    }

    this.callbacks = callbacks;
    await this.connect();
  }

  async restore(callbacks: BaileysCallbacks): Promise<boolean> {
    try {
      await fs.access(CREDS_FILE);
    } catch {
      return false;
    }

    await this.initialize(callbacks);
    return true;
  }

  private async clearAuthState(): Promise<void> {
    try {
      await fs.rm(AUTH_DIR, { recursive: true, force: true });
    } catch {
      // Best-effort cleanup; failures should not block logout.
    }
  }

  private async connect(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
      version,
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      logger,
      markOnlineOnConnect: false,
      browser: Browsers.macOS("Desktop"),
      syncFullHistory: false,
      getMessage: async () => proto.Message.create({}),
    });
    this.sock = sock;

    // Save credentials whenever they update
    sock.ev.on("creds.update", saveCreds);

    // Handle connection lifecycle
    sock.ev.on("connection.update", (update) => {
      // Ignore lifecycle events from a socket superseded by a reconnect.
      if (this.sock !== sock) return;

      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this._status = "qr_pending";
        this._qrCode = qr;
        this.callbacks?.onQr(qr);
      }

      if (connection === "open") {
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
          this.reconnectTimer = null;
        }
        this._status = "ready";
        this._qrCode = null;
        // Extract phone number from the connected user JID
        const jid = sock.user?.id;
        this._phoneNumber = jid ? jid.split(":")[0].split("@")[0] : null;
        this.callbacks?.onReady(this._phoneNumber ?? "unknown");
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const reason = DisconnectReason;

        if (statusCode === reason.loggedOut) {
          this._status = "disconnected";
          this._phoneNumber = null;
          this._qrCode = null;
          this.sock = null;
          this.clearAuthState();
          this.callbacks?.onDisconnected("Logged out");
        } else if (statusCode === reason.restartRequired) {
          // Normal reconnect after QR scan — re-create socket
          this.reconnectNow();
        } else {
          this._status = "disconnected";
          this._qrCode = null;
          this.callbacks?.onDisconnected(
            `Connection closed: ${lastDisconnect?.error?.message ?? "unknown"}`
          );
          this.scheduleReconnect();
        }
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) return;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.reconnectNow();
    }, RECONNECT_DELAY_MS);
  }

  private reconnectNow(): void {
    void this.connect().catch((error) => {
      this.callbacks?.onDisconnected(
        `Reconnect failed: ${error instanceof Error ? error.message : "unknown"}`
      );
      this.scheduleReconnect();
    });
  }

  /**
   * Send a text message.
   * @param phone - Phone number WITHOUT + prefix, e.g. "201234567890"
   * @param text  - Message body
   */
  async sendMessage(phone: string, text: string): Promise<void> {
    if (!this.sock || this._status !== "ready") {
      throw new Error("WhatsApp client is not connected");
    }
    // Baileys JID format: <number>@s.whatsapp.net
    const jid = `${phone.replace(/\D/g, "")}@s.whatsapp.net`;
    await this.sock.sendMessage(jid, { text });
  }

  async logout(): Promise<void> {
    if (this.sock) {
      await this.sock.logout();
      this.sock = null;
      this._status = "disconnected";
      this._phoneNumber = null;
      this._qrCode = null;
      await this.clearAuthState();
    }
  }

  destroy(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
      this._status = "disconnected";
      this._qrCode = null;
    }
  }
}

export const baileysClient = new BaileysClient();
