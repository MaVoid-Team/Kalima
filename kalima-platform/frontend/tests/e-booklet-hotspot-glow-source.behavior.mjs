import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import {
  DEFAULT_E_BOOKLET_HOTSPOT_COLOR,
  getHotspotColorRgb,
  getHotspotGlowLayerStyle,
  getHotspotGlowPercent,
  getHotspotOpacityRatio,
} from "../src/utils/eBookletHotspotStyle.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const styleSource = readFileSync(resolve(__dirname, "../src/utils/eBookletHotspotStyle.js"), "utf8");
const editorSource = readFileSync(resolve(__dirname, "../src/pages/admin/e-booklets/AdminEBookletEditorPage.jsx"), "utf8");
const viewerSource = readFileSync(resolve(__dirname, "../src/pages/e-booklets/EBookletViewerPage.jsx"), "utf8");

assert.match(
  styleSource,
  /backgroundColor:[\s\S]*boxShadow:[\s\S]*inset 0 0/,
  "shared glow style must fill the hotspot area and include inset glow",
);
assert.equal(DEFAULT_E_BOOKLET_HOTSPOT_COLOR, "blue");
assert.equal(getHotspotColorRgb({ display_behavior: { color: "green" } }), "22 163 74");
assert.equal(getHotspotColorRgb({ display_behavior: { color: "unknown" } }), "37 99 235");
assert.equal(getHotspotGlowPercent({ display_behavior: { glow_percent: 250 } }), 100);
assert.equal(getHotspotGlowPercent({ display_behavior: { glow_percent: -10 } }), 0);
assert.equal(getHotspotOpacityRatio({ display_behavior: { opacity_percent: 25 } }), 0.25);
assert.deepEqual(getHotspotGlowLayerStyle({ display_behavior: { glow_percent: 0 } }), {});
assert.deepEqual(getHotspotGlowLayerStyle({ display_behavior: { glow_percent: 60, opacity_percent: 0 } }), {});
assert.deepEqual(
  getHotspotGlowLayerStyle({ display_behavior: { color: "green", glow_percent: 50, opacity_percent: 50 } }),
  {
    backgroundColor: "rgb(22 163 74 / 0.14)",
    boxShadow: "inset 0 0 17px 2px rgb(22 163 74 / 0.19), 0 0 17px 2px rgb(22 163 74 / 0.145)",
  },
);
assert.match(
  styleSource,
  /opacityRatio/,
  "shared glow style must integrate the transparency setting",
);
assert.match(
  editorSource,
  /getHotspotGlowLayerStyle\(hotspot\)/,
  "admin editor hotspots must render the shared full-area glow layer",
);
assert.match(
  editorSource,
  /getHotspotGlowLayerStyle\(draftHotspot\)/,
  "admin draft hotspots must render the shared full-area glow layer",
);
assert.match(
  viewerSource,
  /getHotspotGlowLayerStyle\(hotspot\)/,
  "teacher and student viewer hotspots must render the shared full-area glow layer",
);
assert.match(
  viewerSource,
  /defaultSize:\s*5,[\s\S]*minSize:\s*2,[\s\S]*maxSize:\s*35/,
  "viewer hotspots must use the same scalable geometry envelope as the admin editor",
);
assert.match(
  editorSource,
  /className="pointer-events-none absolute z-20 flex cursor-grab/,
  "admin hotspot parent must not expose a rectangular hitbox",
);
assert.match(
  editorSource,
  /className=\{`pointer-events-auto absolute inset-0 z-10[\s\S]*touch-none[\s\S]*border-2 border-white/,
  "admin hotspot visible shape fill must own pointer events",
);
assert.match(
  viewerSource,
  /className=\{`pointer-events-none absolute flex items-center justify-center text-white/,
  "viewer hotspot parent must not expose a rectangular hitbox",
);
assert.match(
  viewerSource,
  /className=\{`pointer-events-auto absolute inset-0 z-10 border-2 border-white/,
  "viewer hotspot visible shape fill must own pointer events",
);
assert.doesNotMatch(
  viewerSource,
  /className=\{`absolute flex items-center justify-center text-white[^`]*shadow-/,
  "viewer hotspot parent must not render rectangular Tailwind shadow",
);

console.log("e-booklet hotspot glow behavior ok");
