import assert from "node:assert/strict";
import test from "node:test";

import { getHotspotGlowLayerStyle } from "./eBookletHotspotStyle.js";

const createHotspot = (displayBehavior) => ({
  display_behavior: displayBehavior,
});

test("transparent hotspots keep a visible glow when glow is enabled", () => {
  const style = getHotspotGlowLayerStyle(createHotspot({
    opacity_percent: 0,
    glow_percent: 100,
    color: "blue",
  }));

  assert.equal(style.backgroundColor, "rgb(37 99 235 / 0)");
  assert.match(style.background, /radial-gradient/);
  assert.match(style.boxShadow, /rgb\(37 99 235 \/ 0\.[1-9]/);
});

test("transparent hotspots keep a faint glow at the lowest enabled glow value", () => {
  const style = getHotspotGlowLayerStyle(createHotspot({
    opacity_percent: 0,
    glow_percent: 1,
    color: "green",
  }));

  assert.equal(style.backgroundColor, "rgb(22 163 74 / 0)");
  assert.match(style.background, /radial-gradient/);
  assert.match(style.boxShadow, /rgb\(22 163 74 \/ 0\.[1-9]/);
});

test("disabled glow returns no glow even when the hotspot is transparent", () => {
  assert.deepEqual(
    getHotspotGlowLayerStyle(createHotspot({ opacity_percent: 0, glow_percent: 0 })),
    {},
  );
});

test("visible hotspots still receive fill and glow styles", () => {
  const style = getHotspotGlowLayerStyle(createHotspot({
    opacity_percent: 50,
    glow_percent: 100,
    color: "violet",
  }));

  assert.equal(style.backgroundColor, "rgb(124 58 237 / 0.2)");
  assert.equal(style.background, undefined);
  assert.match(style.boxShadow, /rgb\(124 58 237 \/ 0\.[1-9]/);
});
