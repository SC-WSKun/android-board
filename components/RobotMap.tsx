import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { Canvas, Image } from '@shopify/react-native-skia'
import LaserPointAtlas from './LaserPointAtlas'
import { useDrawContext } from '@/store/draw.slice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import { callService } from '@/store/foxglove.trunk'
import { useCar } from '@/hooks/useCar'
import { CarIcon } from './CarIcon'
import { useMap } from '@/hooks/useMap'
import { useLaser } from '@/hooks/useLaser'
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
import { useTransformContext } from '@/store/transform.slice'
import { mapToCanvas } from '@/utils/coodinate'

interface IRobotMapProps {
  plugins: string[]
}

export const CANVAS_WIDTH = 1000
export const CANVAS_HEIGHT = 600

export function RobotMap(props: IRobotMapProps) {
  const { plugins } = props
  const dispatch = useDispatch<AppDispatch>()
  const { mapInfo, drawingMap, userTransform, updateUserTransform } =
    useDrawContext()
  const { viewRect, viewImage, fetchImageData } = useMap()
  const {
    carPosition,
    subscribeCarPosition,
    unsubscribeCarPostition,
    resetCarPosition,
  } = useCar()
  const { subscribeTransforms, unsubscribeTransforms } = useTransformContext()
  const { displayLaser } = useLaser()

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)
  const tapPosition = useSharedValue<{ x: number; y: number } | null>(null)

  /**
   * 用户拖拽事件
   */
  const dragGesture = Gesture.Pan()
    .averageTouches(true)
    .onStart(e => {
      translateX.value = 0
      translateY.value = 0
    })
    .onUpdate(e => {
      translateX.value = e.translationX
      translateY.value = e.translationY
    })
    .onEnd(() => {
      // 这里必须用runOnJS来调用updateUserTransform，因为GestureDetector运行在Reanimated线程，而redux的状态更新在JS线程。
      // 如果不使用runOnJS，RN会崩溃。
      const scale = mapInfo.resolution / userTransform.resolution
      runOnJS(updateUserTransform)({
        x: userTransform.x - translateX.value * scale,
        y: userTransform.y - translateY.value * scale,
        resolution: userTransform.resolution,
      })
      // 重置canvas位置
      translateX.value = 0
      translateY.value = 0
    })

  /**
   * 用户点击事件
   */
  const tapGesture = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      tapPosition.value = { x: _event.x, y: _event.y }
    }
  })

  /**
   * 点击事件触发更新
   * 因为更新涉及状态，所以不能在点击事件中直接runOnJS，需要在reanimated线程中调用
   * 这里参数不能带redux的状态，会崩掉
   */
  useDerivedValue(() => {
    if (tapPosition.value) {
      runOnJS(resetCarPosition)(drawingMap?.map_name || '', {
        translation: {
          x: tapPosition.value.x + viewRect.startX,
          y: tapPosition.value.y + viewRect.startY,
          z: 0,
        },
        rotation: { x: 0, y: 0, z: 0, w: 1 },
      })
      tapPosition.value = null // 重置
    }
  })

  const composedEvent = Gesture.Exclusive(dragGesture, tapGesture)

  /**
   * 动画样式，直接让 Canvas 跟随手指
   */
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }))

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
    }
  }, [drawingMap])

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.mapContainer}>
        <GestureDetector gesture={composedEvent}>
          <Animated.View style={[animatedStyle, styles.animatedMap]}>
            <Canvas style={{ width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
              {/* 地图 */}
              <Image
                image={viewImage}
                fit='contain'
                x={0}
                y={0}
                width={1000}
                height={600}
              />
              {/* 激光点云 */}
              <LaserPointAtlas laserPoints={displayLaser} />
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
      </View>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mapContainer: {
    width: 1000,
    height: 600,
    overflow: 'hidden',
    backgroundColor: 'rgb(127, 127, 127)',
  },
  animatedMap: {
    width: 1000,
    height: 600,
    backgroundColor: 'rgb(127, 127, 127)',
  },
})
