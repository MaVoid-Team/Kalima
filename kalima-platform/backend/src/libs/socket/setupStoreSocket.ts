import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyAccessToken } from "../auth/jwt";
import { prisma } from "../db/prisma";
import { baileysClient } from "../whatsapp/client";
import { generalSettingsService } from "../../apps/store-api/services/general-settings.service";

const ADMIN_ROLES = ["Admin", "SubAdmin", "Moderator"];

export function setupStoreSocket(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: { origin: "*" },
    path: "/socket.io",
  });

  io.on("connection", async (socket) => {
    console.log(`[Socket] New connection attempt: ${socket.id}`);
    
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.query?.token ??
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      console.log(`[Socket] Connection dropped - No token provided for ${socket.id}`);
      return;
    }

    try {
      const payload = verifyAccessToken(token as string);
      const userId = payload.userId;
      console.log(`[Socket] Token verified for userId: ${userId}`);

      const role = await prisma.user_roles.findFirst({
        where: {
          user_id: userId,
          portal: "store",
          role: { in: ADMIN_ROLES as any[] },
        },
      });

      if (role) {
        console.log(`[Socket] User ${userId} authorized. Joining 'store_admins' room.`);
        socket.join("store_admins");
        socket.join(`user:${userId}`);
        
        socket.on("requestWhatsappQr", async () => {
          console.log(`[Socket] Received 'requestWhatsappQr' from user ${userId}`);
          
          // If already connected, notify immediately
          if (baileysClient.status === "ready") {
            console.log(`[Socket] WhatsApp is already ready. Emitting 'whatsappAuthenticated' immediately.`);
            socket.emit("whatsappAuthenticated", {
              status: "accepted",
              whatsapp_sending_number: baileysClient.phoneNumber,
            });
            return;
          }

          console.log(`[Socket] Initializing WhatsApp Baileys Client...`);
          await baileysClient.initialize({
            onQr: (qr) => {
              console.log(`[Socket] WhatsApp QR Code generated! Emitting 'whatsappQr' to store_admins.`);
              io.to("store_admins").emit("whatsappQr", { qr });
            },
            onReady: async (phoneNumber) => {
              console.log(`[Socket] WhatsApp Authenticated successfully with number: ${phoneNumber}`);
              // Save sending number to DB
              await generalSettingsService.updateSendingNumber(phoneNumber);
              io.to("store_admins").emit("whatsappAuthenticated", {
                status: "accepted",
                whatsapp_sending_number: phoneNumber,
              });
            },
            onAuthFailure: (reason) => {
              console.error(`[Socket] WhatsApp Auth Failed:`, reason);
              io.to("store_admins").emit("whatsappAuthFailed", {
                status: "rejected",
                reason,
              });
            },
            onDisconnected: (reason) => {
              console.log(`[Socket] WhatsApp Disconnected:`, reason);
              io.to("store_admins").emit("whatsappDisconnected", { reason });
            },
          });
        });
      } else {
        console.log(`[Socket] User ${userId} lacks Admin/SubAdmin roles. Discarding socket.`);
      }
    } catch (err: any) {
      console.log(`[Socket] Token validation failed:`, err?.message);
      // Invalid token – do not join admin room
    }
  });

  return io;
}
