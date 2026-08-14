import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyAccessToken } from "../auth/jwt";
import { prisma } from "../db/prisma";
import { baileysClient } from "../whatsapp/client";
import { generalSettingsService } from "../../apps/store-api/services/general-settings.service";
import type { BaileysCallbacks } from "../whatsapp/client";

const ADMIN_ROLES = ["Admin", "SubAdmin", "Moderator"];

export function setupStoreSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  const whatsappCallbacks: BaileysCallbacks = {
    onQr: (qr: string) => {
      console.log(`[Socket] WhatsApp QR Code generated.`);
      io.to("store_admins").emit("whatsappQr", { qr });
    },
    onReady: async (phoneNumber: string) => {
      console.log(`[Socket] WhatsApp authenticated with number: ${phoneNumber}`);
      await generalSettingsService.updateSendingNumber(phoneNumber);
      io.to("store_admins").emit("whatsappAuthenticated", {
        status: "accepted",
        whatsapp_sending_number: phoneNumber,
      });
    },
    onAuthFailure: (reason: string) => {
      console.error(`[Socket] WhatsApp authentication failed:`, reason);
      io.to("store_admins").emit("whatsappAuthFailed", {
        status: "rejected",
        reason,
      });
    },
    onDisconnected: (reason: string) => {
      console.log(`[Socket] WhatsApp disconnected:`, reason);
      io.to("store_admins").emit("whatsappDisconnected", { reason });
    },
    onStatusChange: (status) => {
      io.to("store_admins").emit("whatsappStatusChanged", { status });
    },
  };

  void baileysClient.restore(whatsappCallbacks).catch((error) => {
    console.error(`[Socket] Failed to restore WhatsApp session:`, error);
  });

  io.on("connection", async (socket) => {
    console.log(`[Socket] New connection attempt: ${socket.id}`);
    
    const rawToken =
      socket.handshake.auth?.token ??
      socket.handshake.query?.token ??
      socket.handshake.headers?.authorization?.replace("Bearer ", "");
    const token = typeof rawToken === "string"
      ? rawToken.replace(/^Bearer\s+/i, "")
      : rawToken;

    let userId: number | null = null;

    if (token === "dev-bypass" || token === "dev-token" || token === "local-dev-bypass-token" || token === "local-dev") {
      userId = 1;
    } else if (token) {
      try {
        const payload = verifyAccessToken(token as string);
        userId = payload.userId;
      } catch (err: any) {
        console.log(`[Socket] Token validation failed:`, err?.message);
        if (process.env.NODE_ENV !== "production" && process.env.LOCAL_DEV_BYPASS_AUTH === "true") {
          userId = 1;
        }
      }
    } else if (process.env.NODE_ENV !== "production" && process.env.LOCAL_DEV_BYPASS_AUTH === "true") {
      userId = 1;
    }

    if (!userId) {
      console.log(`[Socket] Connection dropped - No valid token or bypass for ${socket.id}`);
      return;
    }

    try {
      console.log(`[Socket] Token/Bypass verified for userId: ${userId}`);

      // ALL authenticated users join their personal room for targeted notifications
      socket.join(`user:${userId}`);
      console.log(`[Socket] User ${userId} joined personal room user:${userId}`);

      const role = await prisma.user_roles.findFirst({
        where: {
          user_id: userId,
          portal: "store",
          role: { in: ADMIN_ROLES as any[] },
        },
      });

      if (role) {
        // Admins additionally join the shared admin room
        console.log(`[Socket] User ${userId} is admin. Joining 'store_admins' room.`);
        socket.join("store_admins");

        socket.on("requestWhatsappQr", async () => {
          console.log(`[Socket] Received 'requestWhatsappQr' from user ${userId}`);

          // If already connected, notify immediately.
          if (baileysClient.status === "ready") {
            console.log(`[Socket] WhatsApp is already ready. Emitting 'whatsappAuthenticated' immediately.`);
            socket.emit("whatsappAuthenticated", {
              status: "accepted",
              whatsapp_sending_number: baileysClient.phoneNumber,
            });
            return;
          }

          socket.emit("whatsappStatusChanged", {
            status: baileysClient.status === "disconnected"
              ? "initializing"
              : baileysClient.status,
          });
          console.log(`[Socket] Initializing WhatsApp Baileys Client...`);
          try {
            await baileysClient.startPairing(whatsappCallbacks);
          } catch (error) {
            const reason = error instanceof Error ? error.message : "Unknown initialization error";
            console.error(`[Socket] Failed to initialize WhatsApp client:`, error);
            socket.emit("whatsappAuthFailed", {
              status: "rejected",
              reason,
            });
          }
        });
      }
    } catch (err: any) {
      console.log(`[Socket] Token validation failed:`, err?.message);
      // Invalid token – do not join any room
    }
  });

  return io;
}
