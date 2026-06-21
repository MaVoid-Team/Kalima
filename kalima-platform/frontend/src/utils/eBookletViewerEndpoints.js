export function buildHotspotContentEndpoint({ viewerBase, instanceId, hotspotId }) {
  return `${viewerBase}/${instanceId}/hotspots/${hotspotId}/content`;
}

export function buildHotspotAssetEndpoint({ viewerBase, instanceId, hotspotId, assetId }) {
  return `${viewerBase}/${instanceId}/hotspots/${hotspotId}/assets/${assetId}`;
}
