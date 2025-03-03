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

// map坐标转Canvas坐标
export const mapToCanvas = (
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

// 小车在map的位置
// map -> odom -> base_footprint
export const mapToBaseFootprint = (
  odomToMap: Transform | null,
  baseFootprintToOdom: Transform | null,
) => {
  if (!odomToMap || !baseFootprintToOdom) {
    return null
  }
  // 计算map到odom的偏航角
  const mapToOdomYaw = Math.atan2(
    2.0 *
      (odomToMap.rotation.x * odomToMap.rotation.y +
        odomToMap.rotation.z * odomToMap.rotation.w),
    1.0 -
      2.0 *
        (odomToMap.rotation.y * odomToMap.rotation.y +
          odomToMap.rotation.z * odomToMap.rotation.z),
  )
  // 计算odom到base_footprint的偏航角
  const odomToBaseYaw = Math.atan2(
    2.0 *
      (baseFootprintToOdom.rotation.x * baseFootprintToOdom.rotation.y +
        baseFootprintToOdom.rotation.z * baseFootprintToOdom.rotation.w),
    1.0 -
      2.0 *
        (baseFootprintToOdom.rotation.y * baseFootprintToOdom.rotation.y +
          baseFootprintToOdom.rotation.z * baseFootprintToOdom.rotation.z),
  )
  // 计算map到odom的旋转矩阵
  const cosMapToOdom = Math.cos(mapToOdomYaw)
  const sinMapToOdom = Math.sin(mapToOdomYaw)
  // 将odomToBaseFootprint的平移向量通过mapToOdom的旋转进行旋转
  const rotatedOdomToBaseX =
    baseFootprintToOdom.translation.x * cosMapToOdom -
    baseFootprintToOdom.translation.y * sinMapToOdom
  const rotatedOdomToBaseY =
    baseFootprintToOdom.translation.x * sinMapToOdom +
    baseFootprintToOdom.translation.y * cosMapToOdom
  // 将旋转后的平移向量加到mapToOdom的平移向量上
  const finalTranslationX = odomToMap.translation.x + rotatedOdomToBaseX
  const finalTranslationY = odomToMap.translation.y + rotatedOdomToBaseY
  // 对于旋转，直接将两个偏航角相加
  const finalYaw = (mapToOdomYaw + odomToBaseYaw) * (180 / Math.PI)

  return {
    x: finalTranslationX,
    y: finalTranslationY,
    yaw: finalYaw,
  }
}
