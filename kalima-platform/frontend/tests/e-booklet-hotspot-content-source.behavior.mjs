import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const editorSource = readFileSync(resolve(__dirname, "../src/pages/admin/e-booklets/AdminEBookletEditorPage.jsx"), "utf8");
const viewerSource = readFileSync(resolve(__dirname, "../src/pages/e-booklets/EBookletViewerPage.jsx"), "utf8");

assert.match(
  editorSource,
  /payload\.supplementary_text\s*=\s*block\.supplementary_text\.trim\(\)/,
  "media hotspot words must be persisted as supplementary_text",
);
assert.match(
  editorSource,
  /updateContentBlock\(index,\s*"supplementary_text"/,
  "admin editor must expose a student-facing words field for media hotspots",
);
assert.match(
  viewerSource,
  /block\.supplementary_text/,
  "student viewer must render supplementary media words",
);
assert.match(
  viewerSource,
  /block\.question\s*\|\|\s*block\.prompt\s*\|\|\s*block\.text_content/,
  "student Q&A viewer must render the saved question text_content",
);

console.log("e-booklet hotspot content behavior ok");
