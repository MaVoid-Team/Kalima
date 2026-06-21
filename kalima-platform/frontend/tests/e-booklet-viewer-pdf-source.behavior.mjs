import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const viewerPath = path.resolve("src/pages/e-booklets/EBookletViewerPage.jsx");
const hookPath = path.resolve("src/hooks/useEBookletAccess.js");
const adminEditorPath = path.resolve("src/pages/admin/e-booklets/AdminEBookletEditorPage.jsx");
const adminHookPath = path.resolve("src/hooks/admin/useAdminEBooklets.js");
const viewerSource = fs.readFileSync(viewerPath, "utf8");
const hookSource = fs.readFileSync(hookPath, "utf8");
const adminEditorSource = fs.readFileSync(adminEditorPath, "utf8");
const adminHookSource = fs.readFileSync(adminHookPath, "utf8");

assert.match(viewerSource, /pdfjsLib\.getDocument/, "viewer should render secured page PDFs with pdf.js");
assert.match(viewerSource, /data-testid="e-booklet-pdf-canvas"/, "viewer should expose the canvas render target");
assert.doesNotMatch(viewerSource, /<iframe\s+title=\{t\("viewer\.pageFrameTitle"/, "viewer should not use the native browser PDF iframe");
assert.match(hookSource, /responseType:\s*"arraybuffer"/, "viewer should fetch page PDFs as array buffers");
assert.match(hookSource, /headers:\s*\{\s*"X-E-Booklet-Page-Token":\s*pageAccessToken\s*\}/s, "document fetch should pass page token in a header");
assert.doesNotMatch(hookSource, /token:\s*pageAccessToken/, "document fetch should not leak page token in query params");
assert.match(hookSource, /signal,/, "document fetch should accept abort signals");
assert.match(hookSource, /pageRequestRef/, "page fetches should ignore stale responses");
assert.match(hookSource, /async \(instanceId, fallbackMessage\)/, "metadata fetch should accept localized fallback messages");
assert.match(viewerSource, /controller\.abort\(\)/, "viewer should abort stale document downloads");
assert.match(viewerSource, /loadedDocument\.destroy/, "viewer should release pdf.js document resources");
assert.match(viewerSource, /\[deviceStatus, instanceId, pageNumber, t, viewer\.fetchPage\]/, "page fetch effect should update fallback text after locale changes");
assert.match(adminEditorSource, /loadedPage\.cleanup/, "admin editor should clean up pdf.js page resources");
assert.match(adminEditorSource, /loadedDocument\.destroy/, "admin editor should destroy pdf.js documents after rendering");
assert.match(adminEditorSource, /controller\.abort\(\)/, "admin editor should abort stale PDF page downloads");
assert.match(adminHookSource, /fetchAssetArrayBuffer = useCallback\(async \(assetId, params, signal\)/, "admin asset array-buffer fetch should accept abort signals");
assert.match(adminHookSource, /responseType:\s*"arraybuffer",\s*params,\s*signal/s, "admin asset array-buffer fetch should pass abort signals to axios");

console.log("e-booklet viewer pdf source behavior ok");
