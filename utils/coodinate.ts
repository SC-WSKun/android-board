// 像素坐标转真实世界坐标
export const pixelToWorldCoordinate = (
  pixelOffsetX: number,
  pixelOffsetY: number,
  scale: number,
  resolution: number,
  originX: number,
  originY: number,
  gridHeight: number,
): { x: number; y: number } => {
  return {
    x: pixelOffsetX * scale * resolution + originX,
    y: (gridHeight - pixelOffsetY * scale) * resolution + originY,
  }
}

// 真实世界坐标转像素坐标
export const worldCoordinateToPixel = (
  worldX: number,
  worldY: number,
  scale: number,
  resolution: number,
  originX: number,
  originY: number,
): { x: number; y: number } => {
  return {
    x: (worldX - originX) / (scale * resolution),
    y: (worldY - originY) / (scale * resolution),
  }
}
