import assert from "node:assert/strict";
import {
  buildHotspotAssetEndpoint,
  buildHotspotContentEndpoint,
} from "../src/utils/eBookletViewerEndpoints.js";

assert.equal(
  buildHotspotContentEndpoint({
    adminMode: false,
    viewerBase: "/e-booklet-viewer",
    instanceId: 10,
    hotspotId: 77,
  }),
  "/e-booklet-viewer/hotspots/77/content",
);

assert.equal(
  buildHotspotAssetEndpoint({
    adminMode: false,
    viewerBase: "/e-booklet-viewer",
    instanceId: 10,
    hotspotId: 77,
    assetId: 123,
  }),
  "/e-booklet-viewer/hotspots/77/assets/123",
);

assert.equal(
  buildHotspotContentEndpoint({
    adminMode: true,
    viewerBase: "/admin/e-booklet-viewer",
    instanceId: 10,
    hotspotId: 77,
  }),
  "/admin/e-booklet-viewer/10/hotspots/77/content",
);

assert.equal(
  buildHotspotAssetEndpoint({
    adminMode: true,
    viewerBase: "/admin/e-booklet-viewer",
    instanceId: 10,
    hotspotId: 77,
    assetId: 123,
  }),
  "/admin/e-booklet-viewer/10/hotspots/77/assets/123",
);

console.log("e-booklet viewer endpoint behavior ok");
