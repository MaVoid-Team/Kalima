import "reflect-metadata";
import "dotenv/config";
import { closeRedis } from "./libs/redis/client";
import { baileysClient } from "./libs/whatsapp/client";
import path from "path";
import express from "express";
import { createServer } from "http";
import storeV2Routes from "./apps/store-api/routes/v2/index";
import authRoutes from "./apps/store-api/routes/v2/auth.routes";
import adminRoutes from "./apps/store-api/routes/v2/admin.routes";
import { errorHandler } from "./libs/errors";
import { setupStoreSocket } from "./libs/socket/setupStoreSocket";
import { startPurchaseNotificationConsumer } from "./apps/store-api/services/notificationStream.service";
import { notificationService } from "./apps/store-api/services/notification.service";
import { emitStorePurchaseToAdmins } from "./libs/redis/socketNotificationEmitter";
import cors from "cors";
import corsOptions from "./config/corsOptions";
import { registerAllExportResources } from "./apps/store-api/export";

const app = express();
const uploadsRoot = path.join(__dirname, "../uploads");

registerAllExportResources();

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  "/uploads/samples",
  (req, res, next) => {
    if (req.path.toLowerCase().endsWith(".pdf")) {
      res.status(403).json({
        success: false,
        message: "Protected PDF samples cannot be downloaded directly",
      });
      return;
    }
    next();
  },
  express.static(path.join(uploadsRoot, "samples")),
);
app.use("/uploads", express.static(uploadsRoot));

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/api/v1/health", (_, res) => {
  res.json({ status: "ok", version: "v1" });
});

app.get("/api/v2/health", async (_, res) => {
  res.json({ status: "ok", version: "v2 new" });
});

app.use("/api/v2", storeV2Routes);
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/admin", adminRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = setupStoreSocket(httpServer);
app.set("io", io);

async function start() {
  try {
    if (process.env.REDIS_URL) {
      startPurchaseNotificationConsumer((payload) => {
        emitStorePurchaseToAdmins(io, payload);
        notificationService.notifyAdminsOfNewOrder(io, {
          id: payload.purchase_id,
          purchase_serial: payload.purchase_serial,
        });
      });
    }

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

function gracefulShutdown() {
  console.log("\n🛑 Shutting down gracefully...");
  baileysClient.destroy();
  httpServer.close(() => {
    closeRedis().finally(() => process.exit(0));
  });
  // Force exit if graceful close takes too long (e.g. open connections)
  setTimeout(() => process.exit(0), 1500);
}

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

start();

export default app;
