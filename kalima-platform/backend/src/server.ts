import "reflect-metadata";
import "dotenv/config";
import express from "express";
import path from "path";
// const loadRoutes = require('../routes')
import storeV2Routes from "./apps/store-api/routes/v2/index";
import authRoutes from "./apps/store-api/routes/v2/auth.routes";
import adminRoutes from "./apps/store-api/routes/v2/admin.routes";
// import { prisma} from './libs/db/prisma';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.get("/api/v1/health", (_, res) => {
  res.json({ status: "ok", version: "v1" });
});

app.get("/api/v2/health", async (_, res) => {
  res.json({ status: "ok", version: "v2 new" });
});

// Legacy
// loadRoutes(app);

// New
app.use("/api/v2", storeV2Routes);
app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/admin", adminRoutes);

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    // await prisma.$connect()
    // console.log('✅ DB Connected')

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();

export default app;
