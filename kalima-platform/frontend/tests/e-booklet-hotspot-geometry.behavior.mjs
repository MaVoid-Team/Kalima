import assert from "node:assert/strict";
import { normalizeHotspotGeometry } from "../src/utils/eBookletHotspotGeometry.js";

assert.deepEqual(
  normalizeHotspotGeometry({ shape: "circle", x_percent: 10, y_percent: 20, width_percent: 4, height_percent: 35, radius_percent: 3 }),
  { shape: "circle", left: 10, top: 20, width: 4, height: 4 },
  "circle hotspots should preserve width-based sizing instead of maxing stale height",
);

assert.deepEqual(
  normalizeHotspotGeometry({ shape: "circle", x_percent: 10, y_percent: 20, radius_percent: 3 }),
  { shape: "circle", left: 10, top: 20, width: 6, height: 6 },
  "legacy circle radius should be interpreted consistently as diameter",
);

console.log("e-booklet hotspot geometry behavior ok");
