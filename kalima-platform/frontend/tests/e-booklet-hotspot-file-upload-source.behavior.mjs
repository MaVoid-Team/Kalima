import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const editorSource = readFileSync(resolve(__dirname, "../src/pages/admin/e-booklets/AdminEBookletEditorPage.jsx"), "utf8");

assert.match(editorSource, /const hotspotFileAccept = \[/, "file hotspot uploads must use an explicit accept list");
assert.match(editorSource, /audio\/\*/, "file hotspot uploads must accept audio media types");
assert.match(editorSource, /video\/\*/, "file hotspot uploads must accept video media types");
assert.match(editorSource, /hotspotFileAccept/, "file hotspot upload input must use the shared accept list");
assert.doesNotMatch(
  editorSource,
  /block\.type === "audio" \? "audio\/\*" : undefined/,
  "file hotspot uploads must not fall back to an unrestricted picker",
);

console.log("e-booklet hotspot file upload behavior ok");
