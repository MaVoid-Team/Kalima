import { CorsOptions } from "cors";
// import allowedOrigins from "./allowedOrigins";

const configuredOrigins = [
  process.env.APP_URL,
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || "").split(","),
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

const allowedOrigins: string[] = Array.from(new Set([
  "capacitor://localhost", // iOS
  "http://localhost", // Android HTTP
  "https://localhost", // Android HTTPS
  "https://kalima-edu.com",
  "https://dev.kalima-edu.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  ...configuredOrigins,
]));

export const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "x-e-booklet-page-token"],
  optionsSuccessStatus: 204,
};

export default corsOptions;
