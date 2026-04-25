import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  makeCacheableSignalKeyStore,
  WASocket,
  proto,
} from "baileys";
import { Boom } from "@hapi/boom";
import P from "pino";
import path from "path";

const AUTH_DIR = path.join(process.cwd(), "baileys_auth");
const logger = P({ level: "silent" }); // suppress Baileys internal logs

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

  get status() { return this._status; }
  get phoneNumber() { return this._phoneNumber; }

  async initialize(callbacks: BaileysCallbacks): Promise<void> {
    // Prevent double-init
    if (this.sock) {
      this.destroy();
    }

    this.callbacks = callbacks;
    await this.connect();
  }

  private async connect(): Promise<void> {
    const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);

    this.sock = makeWASocket({
      auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, logger),
      },
      logger,
      markOnlineOnConnect: false,
      getMessage: async () => proto.Message.create({}),
    });

    // Save credentials whenever they update
    this.sock.ev.on("creds.update", saveCreds);

    // Handle connection lifecycle
    this.sock.ev.on("connection.update", (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this._status = "qr_pending";
        this.callbacks?.onQr(qr);
      }

      if (connection === "open") {
        this._status = "ready";
        // Extract phone number from the connected user JID
        const jid = this.sock?.user?.id;
        this._phoneNumber = jid ? jid.split(":")[0].split("@")[0] : null;
        this.callbacks?.onReady(this._phoneNumber ?? "unknown");
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        const reason = DisconnectReason;

        if (statusCode === reason.loggedOut) {
          this._status = "disconnected";
          this._phoneNumber = null;
          this.sock = null;
          this.callbacks?.onDisconnected("Logged out");
        } else if (statusCode === reason.restartRequired) {
          // Normal reconnect after QR scan — re-create socket
          this.connect();
        } else {
          this._status = "disconnected";
          this.callbacks?.onDisconnected(
            `Connection closed: ${lastDisconnect?.error?.message ?? "unknown"}`
          );
        }
      }
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
    }
  }

  destroy(): void {
    if (this.sock) {
      this.sock.end(undefined);
      this.sock = null;
      this._status = "disconnected";
    }
  }
}

export const baileysClient = new BaileysClient();
