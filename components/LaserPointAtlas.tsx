import store from '@/store/store'
import {
  Skia,
  drawAsImage,
  Group,
  Rect,
  Atlas,
  rect,
} from '@shopify/react-native-skia'
import { useEffect, useState } from 'react'

const size = { width: 5, height: 5 }
const strokeWidth = 2
const imageSize = {
  width: size.width + strokeWidth,
  height: size.height + strokeWidth,
}
const image = drawAsImage(
  <Group>
    <Rect
      rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
      color='cyan'
    />
    <Rect
      rect={rect(strokeWidth / 2, strokeWidth / 2, size.width, size.height)}
      color='blue'
      style='stroke'
      strokeWidth={strokeWidth}
    />
  </Group>,
  imageSize,
)

/**
 * 激光点采用Skia引擎中的Atlas进行绘制，Atlas是一种适用于大量相同图像的绘制优化技术。
 * 这里将激光点的map坐标转换成每个sprite的Transform，然后进行绘制。
 * 因此需要保证sprite的原点在map的origin点，否则绘制结果会偏移。
 */
export default function LaserPointAtlas({
  laserPoints = [],
}: {
  laserPoints: any[]
}) {
  const { mapInfo, scale } = store.getState().draw
  const sprites = new Array(laserPoints.length)
    .fill(0)
    .map(() => rect(0, 0, imageSize.width, imageSize.height))
  const [transforms, updateTransforms] = useState<any[]>([])

  useEffect(() => {
    if (laserPoints.length === 0) {
      return
    }
    const { x: originX, y: originY } = mapInfo.origin.position
    const { resolution } = mapInfo
    const scaleInv = 1 / scale

    const newTransforms = laserPoints.map((point, i) => {
      const tx = ((point.x - originX) * scaleInv) / resolution
      const ty = ((point.y - originY) * scaleInv) / resolution
      return Skia.RSXform(1, 0, tx, ty)
    })
    updateTransforms(prev => newTransforms)
  }, [laserPoints, mapInfo])

  return <Atlas image={image} sprites={sprites} transforms={transforms} />
}
