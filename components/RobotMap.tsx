import { useEffect } from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { Canvas, Image } from '@shopify/react-native-skia'
import LaserPointAtlas from './LaserPointAtlas'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import { useDrawContext } from '@/store/draw.slice'
import { useTransformContext } from '@/store/transform.slice'
import { callService } from '@/store/foxglove.trunk'
import { useCar } from '@/hooks/useCar'
import { useMap } from '@/hooks/useMap'
import { useLaser } from '@/hooks/useLaser'
import { CarIcon } from './CarIcon'
import { CarRoute } from './CarRoute'
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
} from 'react-native-reanimated'
import { getQuaternionFromTranslation, mapToCanvas } from '@/utils/coodinate'
import MapToolBox from './MapToolBox'
import { useNavigation } from '@/hooks/useNavigation'

interface IRobotMapProps {
  plugins: string[]
}

export const CANVAS_WIDTH = Dimensions.get('window').width * 0.75
export const CANVAS_HEIGHT = (600 / 1000) * CANVAS_WIDTH

export function RobotMap(props: IRobotMapProps) {
  //todo： 这里想做成插件式，动态挂载激光点云这些组件
  const { plugins } = props
  const dispatch = useDispatch<AppDispatch>()
  const {
    mapInfo,
    drawingMap,
    userTransform,
    tapMethod,
    routePoints,
    updateUserTransform,
    setCurrentView,
  } = useDrawContext()
  const { viewRect, viewImage, fetchImageData } = useMap()
  const {
    carPosition,
    subscribeCarPosition,
    unsubscribeCarPostition,
    resetCarPosition,
  } = useCar()
  const { navigateToPosition } = useNavigation()
  const { subscribeTransforms, unsubscribeTransforms } = useTransformContext()
  const { displayLaser } = useLaser()

  // 记录画布拖拽距离
  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const translateStartX = useSharedValue(0)
  const translateStartY = useSharedValue(0)
  // 记录画布点击位置
  const tapPosition = useSharedValue<{ x: number; y: number } | null>(null)

  /**
   * 用户拖拽事件
   */
  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onStart(e => {
      translateX.value = 0
      translateStartX.value = e.x
      translateY.value = 0
      translateStartY.value = e.y
    })
    .onUpdate(e => {
      translateX.value = e.translationX
      translateY.value = e.translationY
    })
    .onEnd(_event => {
      // 这里必须用runOnJS来调用updateUserTransform，因为GestureDetector运行在Reanimated线程，而redux的状态更新在JS线程。
      // 如果不使用runOnJS，RN会崩溃。
      switch (tapMethod) {
        case 'REDIRECT': {
          function getQuaternionFromTranslation(
            translateX: number,
            translateY: number,
          ) {
            // 判断是否有效位移，避免 atan2(0, 0) 产生 NaN
            if (translateX === 0 && translateY === 0) {
              return { x: 0, y: 0, z: 0, w: 1 } // 表示无旋转
            }

            // 计算偏航角（弧度）
            const yaw = Math.atan2(translateY, translateX)

            // 计算四元数（绕 Z 轴）
            const halfYaw = yaw / 2
            const sinHalfYaw = Math.sin(halfYaw)
            const cosHalfYaw = Math.cos(halfYaw)

            return {
              x: 0,
              y: 0,
              z: sinHalfYaw,
              w: cosHalfYaw,
            }
          }
          const translatedPosition = {
            translation: {
              x:
                (translateStartX.value + viewRect.startX) *
                  userTransform.resolution +
                mapInfo.origin.position.x,
              y:
                mapInfo.height * mapInfo.resolution -
                (translateStartY.value + viewRect.startY) *
                  userTransform.resolution +
                mapInfo.origin.position.y,
              z: 0,
            },
            rotation: getQuaternionFromTranslation(
              _event.translationX,
              -_event.translationY,
            ),
          }
          runOnJS(resetCarPosition)(
            drawingMap?.map_name || '',
            translatedPosition,
          )
          break
        }
        default:
          runOnJS(updateUserTransform)({
            x: userTransform.x - translateX.value,
            y: userTransform.y - translateY.value,
            resolution: userTransform.resolution,
          })
      }
      // 重置canvas位置
      translateX.value = 0
      translateY.value = 0
    })

  /**
   * 用户点击事件
   * 这里拿到的坐标是canvas坐标，需要后续转换成map坐标
   */
  const tapGesture = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      tapPosition.value = { x: _event.x, y: _event.y }
    }
  })

  /**
   * 点击事件触发更新
   * 因为更新涉及状态，所以不能在点击事件中直接runOnJS，需要在reanimated线程中调用
   */
  useDerivedValue(() => {
    // 计算用户缩放后的地图坐标转换成map坐标
    if (tapPosition.value) {
      const translatedPosition = {
        translation: {
          x:
            (tapPosition.value.x + viewRect.startX) * userTransform.resolution +
            mapInfo.origin.position.x,
          y:
            mapInfo.height * mapInfo.resolution -
            (tapPosition.value.y + viewRect.startY) * userTransform.resolution +
            mapInfo.origin.position.y,
          z: 0,
        },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      }
      switch (tapMethod) {
        case 'NAVIGATION':
          runOnJS(navigateToPosition)(
            translatedPosition.translation.x,
            translatedPosition.translation.y,
          )
      }
      tapPosition.value = null // 重置
    }
  })

  /**
   * 混合拖拽和点击事件
   */
  const composedEvent = Gesture.Exclusive(dragGesture, tapGesture)

  /**
   * 动画样式，直接让 Canvas 跟随手指
   */
  const animatedStyle = useAnimatedStyle(() => {
    if (tapMethod === 'REDIRECT') {
      return {
        transform: [],
      }
    } else {
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
        ],
      }
    }
  })

  /**
   * 订阅必须topic，卸载组件时取消订阅
   * tf: 更新baseFootprintToOdom,leftWheelToBaseLink,rightWheelToBaseLink,odomToMap(导航模式下)
   * tf_static: 更新laserLinkToBaseLink, baseLinkToBaseFootprint
   */
  useEffect(() => {
    fetchImageData().then(() => {
      // 切换到导航模式
      dispatch(
        callService('/tiered_nav_state_machine/switch_mode', {
          mode: 2,
        }),
      )
      subscribeCarPosition()
      subscribeTransforms()
    })
    return () => {
      unsubscribeCarPostition()
      unsubscribeTransforms()
      setCurrentView('select-map')
    }
  }, [drawingMap])

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <GestureHandlerRootView>
          <GestureDetector gesture={composedEvent}>
            <Animated.View style={[animatedStyle, styles.animatedMap]}>
              <Canvas style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
                {/* 地图 */}
                <Image
                  image={viewImage}
                  fit='contain'
                  x={0}
                  y={0}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                />
                {/* 激光点云 */}
                {/* <LaserPointAtlas laserPoints={displayLaser} /> */}
                {/* 预计路线 */}
                <CarRoute route={routePoints} />
                {/* 小车 */}
                <CarIcon
                  carPosition={{
                    ...mapToCanvas(carPosition.x, carPosition.y),
                    yaw: carPosition.yaw,
                  }}
                />
              </Canvas>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </View>
      <MapToolBox />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    overflow: 'hidden',
  },
  mapContainer: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
    overflow: 'hidden',
    backgroundColor: 'rgb(127, 127, 127)',
  },
  animatedMap: {
    width: CANVAS_WIDTH,
    height: CANVAS_HEIGHT,
  },
})
