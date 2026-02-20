import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { verifyAccessToken } from "../auth/jwt";
import { prisma } from "../db/prisma";

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
      }
    } catch {
      // Invalid token – do not join admin room
    }
  });

  return io;
}
