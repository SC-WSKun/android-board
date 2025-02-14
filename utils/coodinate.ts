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

// 点云应用坐标系转换
export const applyTransform = (
  points: { x: number; y: number },
  transform: Transform | null,
) => {
  if (!transform || !points) return null
  const { rotation, translation } = transform
  const yaw = Math.atan2(
    2.0 * (rotation.w * rotation.z + rotation.x * rotation.y),
    1.0 - 2.0 * (rotation.y * rotation.y + rotation.z * rotation.z),
  )
  const rotatedX = Math.cos(yaw) * points.x - Math.sin(yaw) * points.y
  const rotatedY = Math.sin(yaw) * points.x + Math.cos(yaw) * points.y
  return {
    x: rotatedX + translation.x,
    y: rotatedY + translation.y,
  }
}
