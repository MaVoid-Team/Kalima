export function buildHotspotContentEndpoint({ adminMode = false, viewerBase, instanceId, hotspotId }) {
  if (adminMode) {
    return `${viewerBase}/${instanceId}/hotspots/${hotspotId}/content`;
  }
  return `${viewerBase}/hotspots/${hotspotId}/content`;
}

export function buildHotspotAssetEndpoint({ adminMode = false, viewerBase, instanceId, hotspotId, assetId }) {
  if (adminMode) {
    return `${viewerBase}/${instanceId}/hotspots/${hotspotId}/assets/${assetId}`;
  }
  return `${viewerBase}/hotspots/${hotspotId}/assets/${assetId}`;
}
