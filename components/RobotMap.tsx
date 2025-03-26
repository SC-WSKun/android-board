import { useEffect, useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
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
import { mapToCanvas } from '@/utils/coodinate'
import Icon from 'react-native-vector-icons/FontAwesome'
import Toast from 'react-native-toast-message'

interface IRobotMapProps {
  plugins: string[]
}

type TapMethod = 'POINTER' | 'REDIRECT' | 'NAVIGATION'

export const CANVAS_WIDTH = 1000
export const CANVAS_HEIGHT = 600

export function RobotMap(props: IRobotMapProps) {
  //todo： 这里想做成插件式，动态挂载激光点云这些组件
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

  const [tapMethod, setTapMethod] = useState<TapMethod>('NAVIGATION')

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
      runOnJS(updateUserTransform)({
        x: userTransform.x - translateX.value,
        y: userTransform.y - translateY.value,
        resolution: userTransform.resolution,
      })
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
   * 这里参数不能带redux的状态，会崩掉
   */
  useDerivedValue(() => {
    if (tapPosition.value) {
      // 计算用户缩放后的地图坐标转换成 map 坐标
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

      if (tapMethod === 'REDIRECT') {
        runOnJS(resetCarPosition)(
          drawingMap?.map_name || '',
          translatedPosition,
        )
      }
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
   * 放大地图
   */
  const scaleUp = () => {
    updateUserTransform({
      x: userTransform.x,
      y: userTransform.y,
      resolution: userTransform.resolution * 0.5,
    })
  }

  /**
   * 缩小地图
   */
  const scaleDown = () => {
    updateUserTransform({
      x: userTransform.x,
      y: userTransform.y,
      resolution: userTransform.resolution * 2,
    })
  }

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
    <View style={styles.container}>
      <GestureHandlerRootView style={styles.mapContainer}>
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
      </GestureHandlerRootView>
      <View style={styles.toolContainer}>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'You Have Switched To Pointer Mode',
            })
            setTapMethod('POINTER')
          }}
        >
          <Icon
            name='mouse-pointer'
            size={20}
            color='#007bff'
            style={[styles.btnIcon, { paddingLeft: 7.5, paddingTop: 3.5 }]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'You Have Switched To Redirect Mode',
            })
            setTapMethod('REDIRECT')
          }}
        >
          <Icon
            name='thumb-tack'
            size={25}
            color='#007bff'
            style={[styles.btnIcon, { paddingLeft: 5.5 }]}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.toolBtn}
          onPress={() => {
            Toast.show({
              type: 'info',
              text1: 'You Have Switched To Navigation Mode',
            })
            setTapMethod('NAVIGATION')
          }}
        >
          <Icon
            name='road'
            size={25}
            color='#007bff'
            style={[styles.btnIcon, { paddingLeft: 0 }]}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={scaleUp}>
          <Icon
            name='search-plus'
            size={25}
            color='#007bff'
            style={styles.btnIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolBtn} onPress={scaleDown}>
          <Icon
            name='search-minus'
            size={25}
            color='#007bff'
            style={styles.btnIcon}
          />
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
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
  toolContainer: {
    width: 80,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 12,
  },
  toolBtn: {
    width: 40,
    height: 40,
    padding: 5,
    borderColor: '#007bff',
    borderWidth: 2,
    borderRadius: 5,
  },
  btnIcon: {
    backgroundColor: 'transparent', // 图标的背景颜色
  },
})
