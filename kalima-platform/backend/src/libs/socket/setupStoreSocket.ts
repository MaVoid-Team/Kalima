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
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.query?.token ??
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) return;

    try {
      const payload = verifyAccessToken(token as string);
      const userId = payload.userId;

      const role = await prisma.user_roles.findFirst({
        where: {
          user_id: userId,
          portal: "store",
          role: { in: ADMIN_ROLES as any[] },
        },
      });

      if (role) {
        socket.join("store_admins");
        socket.join(`user:${userId}`);
        
        socket.on("requestWhatsappQr", async () => {
          // If already connected, notify immediately
          if (baileysClient.status === "ready") {
            socket.emit("whatsappAuthenticated", {
              status: "accepted",
              whatsapp_sending_number: baileysClient.phoneNumber,
            });
            return;
          }

          await baileysClient.initialize({
            onQr: (qr) => {
              io.to("store_admins").emit("whatsappQr", { qr });
            },
            onReady: async (phoneNumber) => {
              // Save sending number to DB
              await generalSettingsService.updateSendingNumber(phoneNumber);
              io.to("store_admins").emit("whatsappAuthenticated", {
                status: "accepted",
                whatsapp_sending_number: phoneNumber,
              });
            },
            onAuthFailure: (reason) => {
              io.to("store_admins").emit("whatsappAuthFailed", {
                status: "rejected",
                reason,
              });
            },
            onDisconnected: (reason) => {
              io.to("store_admins").emit("whatsappDisconnected", { reason });
            },
          });
        });
      }
    } catch {
      // Invalid token – do not join admin room
    }
  });

  return io;
}
