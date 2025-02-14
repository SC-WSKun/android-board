export const transformPointCloud = (pointCloud: LaserPoint) => {
  const points = []
  let angle = pointCloud.angle_min
  // 忽略min和max之外的角度的点
  const min = pointCloud.range_min
  const max = pointCloud.range_max
  for (const range of pointCloud.ranges) {
    if (range <= max && range >= min) {
      points.push({
        x: range * Math.cos(angle),
        y: range * Math.sin(angle),
      })
    }
    angle += pointCloud.angle_increment
  }
  return points
}
