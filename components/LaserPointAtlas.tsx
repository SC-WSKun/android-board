import { GlobalProvider, useGlobal } from '@/store/globalContext'
import {
  Skia,
  drawAsImage,
  Group,
  Rect,
  Atlas,
  rect,
} from '@shopify/react-native-skia'
import { useEffect, useState } from 'react'

const size = { width: 25, height: 11.25 }
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

export default function LaserPointAtlas() {
  const numberOfBoxes = 150
  const pos = { x: 128, y: 128 }
  const width = 256
  const sprites = new Array(numberOfBoxes)
    .fill(0)
    .map(() => rect(0, 0, imageSize.width, imageSize.height))
  const [transforms, updateTransforms] = useState(
    new Array(numberOfBoxes).fill(0).map((_, i) => {
      const tx = 5 + ((i * size.width) % width)
      const ty = 25 + Math.floor(i / (width / size.width)) * size.width
      const r = Math.atan2(pos.y - ty, pos.x - tx)
      return Skia.RSXform(Math.cos(r), Math.sin(r), tx, ty)
    }),
  )

  return <Atlas image={image} sprites={sprites} transforms={transforms} />
}
