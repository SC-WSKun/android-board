import { PlanPose } from '@/store/draw.slice'
import { mapToCanvas } from '@/utils/coodinate'
import { Path, Skia } from '@shopify/react-native-skia'

interface ICarRoute {
  route: PlanPose[]
}

export function CarRoute(props: ICarRoute) {
  const { route } = props
  const routePoints = route.map((item: PlanPose) => {
    const mapX = item.pose.position.x
    const mapY = item.pose.position.y
    return mapToCanvas(mapX, mapY)
  })
  const routePath = Skia.Path.Make()
  for (let i = 0; i < routePoints.length; i++) {
    if (i === 0) {
      routePath.moveTo(routePoints[i].x, routePoints[i].y)
    } else {
      routePath.lineTo(routePoints[i].x, routePoints[i].y)
    }
  }

  //todo: 一段时间后清空导航路径

  return (
    <Path
      path={routePath}
      color={'grey'}
      style='stroke'
      strokeJoin='round'
      strokeWidth={2}
    />
  )
}
