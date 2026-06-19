import path from "path";
import dotenv from "dotenv";

const backendEnvPath = path.resolve(process.cwd(), ".env");
const platformEnvPath = path.resolve(process.cwd(), "..", ".env");

dotenv.config({ path: backendEnvPath });
dotenv.config({ path: platformEnvPath });
