import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@/components/RobotMap'
import store from '@/store/store'

// 像素坐标转地图坐标
export const canvasToMap = (
  pixelOffsetX: number,
  pixelOffsetY: number,
  startX: number,
  startY: number,
): { x: number; y: number } => {
  const {
    mapInfo: { resolution },
    userTransform,
  } = store.getState().draw
  const scale = userTransform.resolution / resolution
  return {
    x: (pixelOffsetX + startX) * scale,
    y: (pixelOffsetY + startY) * scale,
  }
}

// 小车坐标转Canvas坐标
export const mapToCanvas = (
  mapX: number,
  mapY: number,
): { x: number; y: number } => {
  const {
    mapInfo: { resolution, origin },
    centerPoint, // Canvas中心点对应的地图坐标,经过userResolution变换过了
    userTransform,
  } = store.getState().draw
  const scale = resolution / userTransform.resolution
  // 小车坐标转到地图坐标系
  const worldX = (mapX - origin.position.x) * scale
  const worldY = CANVAS_HEIGHT - (mapY - origin.position.y) * scale
  // 地图坐标系转到当前视图位置
  const currentX = worldX + CANVAS_WIDTH / 2 - centerPoint.x
  const currentY = worldY + CANVAS_HEIGHT / 2 - centerPoint.y
  return {
    x: currentX,
    y: currentY,
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
// baseFootprint到Map的transform就是baseFootprint在Map下的位置，即小车的位置
export const BaseFootprintToMap = (
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
