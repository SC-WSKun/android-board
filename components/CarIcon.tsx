import { CarPosition } from '@/hooks/useCar'
import { Circle } from '@shopify/react-native-skia'

interface ICarIcon {
  carPosition: CarPosition
}

export function CarIcon(props: ICarIcon) {
  const { carPosition } = props

  return (
    <Circle cx={carPosition.x} cy={carPosition.y} r={4} color='lightblue' />
  )
}
