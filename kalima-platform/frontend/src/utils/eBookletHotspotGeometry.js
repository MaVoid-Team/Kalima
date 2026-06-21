const clamp = (value, fallback, min, max) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
};

export function normalizeHotspotGeometry(hotspot, options = {}) {
  const shape = hotspot?.shape || "circle";
  const minSize = options.minSize ?? 2;
  const maxSize = options.maxSize ?? 40;
  const defaultSize = options.defaultSize ?? 8;
  const radiusDiameter = Number.isFinite(Number(hotspot?.radius_percent))
    ? Number(hotspot.radius_percent) * 2
    : undefined;
  const rawWidth = hotspot?.width_percent ?? radiusDiameter;
  const rawHeight = hotspot?.height_percent ?? radiusDiameter;
  const width = clamp(rawWidth, defaultSize, minSize, maxSize);
  const height = clamp(rawHeight, defaultSize, minSize, maxSize);
  const circleSize = clamp(rawWidth, defaultSize, minSize, maxSize);
  const squareSize = Math.max(width, height);

  return {
    shape,
    left: clamp(hotspot?.x_percent, 50, 0, 100),
    top: clamp(hotspot?.y_percent, 50, 0, 100),
    width: shape === "circle" ? circleSize : shape === "square" ? squareSize : width,
    height: shape === "circle" ? circleSize : shape === "square" ? squareSize : height,
  };
}
