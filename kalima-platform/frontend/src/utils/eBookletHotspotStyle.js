export const DEFAULT_E_BOOKLET_HOTSPOT_COLOR = "blue";

export const E_BOOKLET_HOTSPOT_COLOR_RGB_MAP = {
  red: "220 38 38",
  blue: "37 99 235",
  green: "22 163 74",
  amber: "217 119 6",
  violet: "124 58 237",
};

const clampPercent = (value, fallback = 100) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(100, Math.max(0, parsed));
};

export const getHotspotOpacityRatio = (hotspot) =>
  clampPercent(hotspot?.display_behavior?.opacity_percent, 100) / 100;

export const getHotspotGlowPercent = (hotspot) =>
  clampPercent(hotspot?.display_behavior?.glow_percent, 100);

export const getHotspotColorRgb = (hotspot) => {
  const color = hotspot?.display_behavior?.color;
  return E_BOOKLET_HOTSPOT_COLOR_RGB_MAP[color] || E_BOOKLET_HOTSPOT_COLOR_RGB_MAP[DEFAULT_E_BOOKLET_HOTSPOT_COLOR];
};

export const getHotspotGlowLayerStyle = (hotspot) => {
  const glow = getHotspotGlowPercent(hotspot);
  const opacityRatio = getHotspotOpacityRatio(hotspot);
  if (glow <= 0 || opacityRatio <= 0) return {};

  const glowRatio = glow / 100;
  const hotspotColor = getHotspotColorRgb(hotspot);
  const blur = 8 + Math.round(glowRatio * 18);
  const spread = Math.round(glowRatio * 4);
  const fillAlpha = (0.16 + glowRatio * 0.24) * opacityRatio;
  const innerAlpha = (0.24 + glowRatio * 0.28) * opacityRatio;
  const outerAlpha = (0.18 + glowRatio * 0.22) * opacityRatio;

  return {
    backgroundColor: `rgb(${hotspotColor} / ${fillAlpha})`,
    boxShadow: `inset 0 0 ${blur}px ${Math.max(1, spread)}px rgb(${hotspotColor} / ${innerAlpha}), 0 0 ${blur}px ${spread}px rgb(${hotspotColor} / ${outerAlpha})`,
  };
};
