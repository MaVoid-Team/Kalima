import path from "path";
import dotenv from "dotenv";

const backendLocalEnvPath = path.resolve(process.cwd(), ".env.local");
const backendEnvPath = path.resolve(process.cwd(), ".env");
const platformLocalEnvPath = path.resolve(process.cwd(), "..", ".env.local");
const platformEnvPath = path.resolve(process.cwd(), "..", ".env");

dotenv.config({ path: backendLocalEnvPath });
dotenv.config({ path: backendEnvPath });
dotenv.config({ path: platformLocalEnvPath });
dotenv.config({ path: platformEnvPath });
