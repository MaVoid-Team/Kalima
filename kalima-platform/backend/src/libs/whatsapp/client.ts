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

export type WhatsAppStatus =
  | "disconnected"
  | "initializing"
  | "qr_pending"
  | "reconnecting"
  | "ready";

export type BaileysCallbacks = {
  onQr: (qr: string) => void;
  onReady: (phoneNumber: string) => void | Promise<void>;
  onAuthFailure: (reason: string) => void;
  onDisconnected: (reason: string) => void;
  onStatusChange?: (status: WhatsAppStatus) => void;
};

type BaileysClientOptions = {
  authDir?: string;
  reconnectDelaysMs?: number[];
};

const logger = P({ level: "silent" });
const originalConsoleLog = console.log;
console.log = function (...args: any[]) {
  if (typeof args[0] === "string" && args[0].startsWith("Closing session:")) return;
  originalConsoleLog.apply(console, args);
};

export class BaileysClient {
  private sock: WASocket | null = null;
  private callbacks: BaileysCallbacks | null = null;
  private _status: WhatsAppStatus = "disconnected";
  private _phoneNumber: string | null = null;
  private connectPromise: Promise<void> | null = null;
  private _qrCode: string | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempt = 0;
  private generation = 0;
  private intentionalStop = false;
  private readonly authDir: string;
  private readonly reconnectDelaysMs: number[];

  constructor(options: BaileysClientOptions = {}) {
    this.authDir = options.authDir ?? AUTH_DIR;
    this.reconnectDelaysMs =
      options.reconnectDelaysMs ?? [1_000, 2_000, 4_000, 8_000, 16_000];
  }

  get status() { return this._status; }
  get phoneNumber() { return this._phoneNumber; }
  get qrCode() { return this._qrCode; }

  async restore(callbacks: BaileysCallbacks): Promise<boolean> {
    this.callbacks = callbacks;
    try {
      await fs.access(path.join(this.authDir, "creds.json"));
    } catch {
      return false;
    }
    await this.initialize(callbacks);
    return true;
  }

  async initialize(callbacks: BaileysCallbacks): Promise<void> {
    this.callbacks = callbacks;
    this.intentionalStop = false;

    if (this.sock || this._status === "ready") return;
    if (this.connectPromise) return this.connectPromise;
    if (this.reconnectTimer) return;

    this.setStatus("initializing");
    try {
      await this.startConnection();
    } catch (error: any) {
      this.setStatus("disconnected");
      this.callbacks?.onAuthFailure(error?.message ?? "Initialization failed");
    }
  }

  async startPairing(callbacks: BaileysCallbacks): Promise<void> {
    // An explicit QR request must not reuse a stale persisted session. Wait for
    // any current initialization to settle, stop its reconnect lifecycle, and
    // remove the saved credentials before creating the fresh pairing socket.
    if (this.connectPromise) {
      await this.connectPromise.catch(() => undefined);
    }
    this.destroy();
    this.connectPromise = null;
    await this.clearAuthState();
    await this.initialize(callbacks);
  }

  private setStatus(status: WhatsAppStatus): void {
    this._status = status;
    if (status !== "qr_pending") this._qrCode = null;
    this.callbacks?.onStatusChange?.(status);
  }

  private async prepareAuthDirectory(): Promise<void> {
    await fs.mkdir(this.authDir, { recursive: true, mode: 0o700 });
    await fs.chmod(this.authDir, 0o700);
  }

  private startConnection(): Promise<void> {
    if (this.connectPromise) return this.connectPromise;

    const connection = this.connect();
    this.connectPromise = connection;
    void connection.then(
      () => {
        if (this.connectPromise === connection) this.connectPromise = null;
      },
      () => {
        if (this.connectPromise === connection) this.connectPromise = null;
      },
    );
    return connection;
  }

  private async connect(): Promise<void> {
    await this.prepareAuthDirectory();
    const { state, saveCreds } = await useMultiFileAuthState(this.authDir);
    const { version } = await fetchLatestBaileysVersion();
    const generation = ++this.generation;

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

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async (update) => {
      if (generation !== this.generation) return;
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        this._qrCode = qr;
        this.setStatus("qr_pending");
        this.callbacks?.onQr(qr);
      }

      if (connection === "open") {
        this.reconnectAttempt = 0;
        const jid = sock.user?.id;
        this._phoneNumber = jid ? jid.split(":")[0].split("@")[0] : null;
        this.setStatus("ready");
        try {
          await this.callbacks?.onReady(this._phoneNumber ?? "unknown");
        } catch (error: any) {
          this.callbacks?.onAuthFailure(
            error?.message ?? "Connected, but status persistence failed",
          );
        }
      }

      if (connection === "close") {
        const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
        this.sock = null;
        this.connectPromise = null;

        if (this.intentionalStop || statusCode === DisconnectReason.loggedOut) {
          await this.handleLoggedOut("Logged out");
          return;
        }

        this.scheduleReconnect(
          statusCode === DisconnectReason.restartRequired
            ? "Restart required"
            : lastDisconnect?.error?.message ?? "Connection closed",
        );
      }
    });
  }

  private scheduleReconnect(reason: string): void {
    if (this.intentionalStop || this.reconnectTimer) return;
    const delay = this.reconnectDelaysMs[this.reconnectAttempt];
    if (delay === undefined) {
      this.setStatus("disconnected");
      this.callbacks?.onDisconnected(`Reconnect attempts exhausted: ${reason}`);
      return;
    }

    this.reconnectAttempt += 1;
    this.setStatus("reconnecting");
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.startConnection().catch((error) => {
        this.scheduleReconnect(error?.message ?? "Reconnect failed");
      });
    }, delay);
  }

  private async clearAuthState(): Promise<void> {
    await fs.rm(this.authDir, { recursive: true, force: true });
  }

  private async handleLoggedOut(reason: string): Promise<void> {
    this.cancelReconnect();
    this.generation += 1;
    this.sock = null;
    this._phoneNumber = null;
    this.setStatus("disconnected");
    await this.clearAuthState();
    this.callbacks?.onDisconnected(reason);
  }

  async sendMessage(phone: string, text: string): Promise<void> {
    if (!this.sock || this._status !== "ready") {
      throw new Error("WhatsApp client is not connected");
    }
    const jid = `${phone.replace(/\D/g, "")}@s.whatsapp.net`;
    await this.sock.sendMessage(jid, { text });
  }

  async logout(): Promise<void> {
    this.intentionalStop = true;
    this.cancelReconnect();
    const sock = this.sock;
    this.generation += 1;
    this.sock = null;
    this._phoneNumber = null;
    this.setStatus("disconnected");
    if (sock) await sock.logout();
    await this.clearAuthState();
    this.callbacks?.onDisconnected("logout");
  }

  destroy(): void {
    this.intentionalStop = true;
    this.cancelReconnect();
    this.generation += 1;
    const sock = this.sock;
    this.sock = null;
    this._phoneNumber = null;
    this.setStatus("disconnected");
    sock?.end(undefined);
  }

  private cancelReconnect(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;
  }
}

export const baileysClient = new BaileysClient();
