import { CorsOptions } from "cors";
// import allowedOrigins from "./allowedOrigins";

const allowedOrigins: string[] = [
  "capacitor://localhost", // iOS
  "http://localhost", // Android HTTP
  "https://localhost", // Android HTTPS
  "https://kalima-edu.com",
  "https://dev.kalima-edu.com",
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export const corsOptions: CorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

export default corsOptions;
