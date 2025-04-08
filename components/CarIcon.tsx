import { CarPosition } from '@/hooks/useCar'
import { Group, Oval, Path, Skia } from '@shopify/react-native-skia'

interface ICarIcon {
  carPosition: CarPosition
}

export function CarIcon(props: ICarIcon) {
  const {
    carPosition: { x, y, yaw },
  } = props
  // 绘制向右的箭头
  // 这里应该是机器人那边的默认设置，偏航角的默认起始方向向右
  const carDirection = Skia.Path.Make()
  carDirection.moveTo(x + 16, y)
  carDirection.lineTo(x + 6, y - 6)
  carDirection.lineTo(x + 6, y + 6)
  carDirection.lineTo(x + 16, y)
  carDirection.close()

  return (
    <Group>
      <Path
        path={carDirection}
        color='blue'
        origin={Skia.Point(x, y)}
        transform={[
          { rotateZ: -(yaw * Math.PI) / 180 }, // 旋转（角度转弧度）
        ]}
      />
      <Oval x={x - 4} y={y - 4} width={8} height={8} color='lightblue' />
    </Group>
  )
}
