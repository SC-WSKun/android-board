import { CarPosition } from '@/hooks/useCar'
import { Group, Oval, Path, Skia } from '@shopify/react-native-skia'

interface ICarIcon {
  carPosition: CarPosition
}

export function CarIcon(props: ICarIcon) {
  const {
    carPosition: { x, y, yaw },
  } = props
  const carDirection = Skia.Path.Make()
  carDirection.moveTo(x, y - 16)
  carDirection.lineTo(x - 6, y - 6)
  carDirection.lineTo(x + 6, y - 6)
  carDirection.lineTo(x, y - 16)
  carDirection.close()

  return (
    <Group>
      <Path
        path={carDirection}
        color='blue'
        origin={Skia.Point(x, y)}
        transform={[
          { rotateZ: (yaw * Math.PI) / 180 }, // 旋转（角度转弧度）a
        ]}
      />
      <Oval x={x - 4} y={y - 4} width={8} height={8} color='lightblue' />
    </Group>
  )
}
