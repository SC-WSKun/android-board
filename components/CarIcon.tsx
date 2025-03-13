import { CarPosition } from '@/hooks/useCar'
import { Group, Oval, Path, Skia } from '@shopify/react-native-skia'
import { useState } from 'react'

interface ICarIcon {
  carPosition: CarPosition
}

export function CarIcon(props: ICarIcon) {
  const {
    carPosition: { yaw },
  } = props
  const cx = 500
  const cy = 300
  const carDirection = Skia.Path.Make()
  carDirection.moveTo(cx, cy - 16)
  carDirection.lineTo(cx - 6, cy - 6)
  carDirection.lineTo(cx + 6, cy - 6)
  carDirection.lineTo(cx, cy - 16)
  carDirection.close()

  return (
    <Group>
      <Path
        path={carDirection}
        color='blue'
        origin={Skia.Point(cx, cy)}
        transform={[
          { rotateZ: (yaw * Math.PI) / 180 }, // 旋转（角度转弧度）a
        ]}
      />
      <Oval x={496} y={296} width={8} height={8} color='lightblue' />
    </Group>
  )
}
