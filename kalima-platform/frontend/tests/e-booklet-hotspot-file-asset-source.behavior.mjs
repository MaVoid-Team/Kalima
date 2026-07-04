import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const serviceSource = readFileSync(
  resolve(__dirname, "../../backend/src/apps/store-api/services/e-booklet.service.ts"),
  "utf8",
);

assert.match(
  serviceSource,
  /const fileType = requestedSafeAttachment \? inferredStorageType : requestedFileType \|\| inferredStorageType/,
  "generic file hotspot uploads must store audio/video/image assets as their inferred media type",
);

console.log("e-booklet hotspot file asset behavior ok");
