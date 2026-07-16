import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const gallerySource = readFileSync(
  resolve("src/components/ProductDetails/ImageGallery.jsx"),
  "utf8",
);

assert.match(
  gallerySource,
  /data-testid=\"product-gallery-main-button\"/,
  "the selected product image must expose an interactive viewer trigger",
);
assert.match(
  gallerySource,
  /data-testid=\"product-image-viewer\"/,
  "the image viewer must render as a dedicated dialog",
);
assert.match(
  gallerySource,
  /data-testid=\"product-image-zoom-in\"/,
  "the image viewer must expose a zoom-in control",
);
assert.match(
  gallerySource,
  /data-testid=\"product-image-zoom-out\"/,
  "the image viewer must expose a zoom-out control",
);
assert.match(
  gallerySource,
  /Math\.min\(3, Math\.max\(1, previousZoom \+ amount\)\)/,
  "viewer zoom must stay within the supported range",
);

console.log("product image viewer source behavior ok");
