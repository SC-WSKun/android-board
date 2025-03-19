import { useEffect, useMemo } from 'react'
import { Button, View, StyleSheet } from 'react-native'
import { Canvas, Image } from '@shopify/react-native-skia'
import LaserPointAtlas from './LaserPointAtlas'
import { useDrawContext } from '@/store/draw.slice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import {
  callService,
  listenMessage,
  readMsgWithSubId,
  subscribeTopic,
} from '@/store/foxglove.trunk'
import { useTransformContext } from '@/store/transform.slice'
import { useCar } from '@/hooks/useCar'
import { CarIcon } from './CarIcon'
import { useMap } from '@/hooks/useMap'
import { useLaser } from '@/hooks/useLaser'
import { rosLog } from '@/log/logger'
import {
  GestureHandlerRootView,
  GestureDetector,
  Gesture,
} from 'react-native-gesture-handler'
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated'

interface IRobotMapProps {
  plugins: string[]
}

export function RobotMap(props: IRobotMapProps) {
  const { plugins } = props
  const width = 1000 // canvas宽度
  const height = 600 // canvas高度
  const dispatch = useDispatch<AppDispatch>()
  const { drawingMap, userTransform, updateUserTransform } = useDrawContext()
  const { viewImage, fetchImageData } = useMap()
  const { carPosition, subscribeCarPosition, unsubscribeCarPostition } =
    useCar()
  const { displayLaser } = useLaser()
  const { updateTransform } = useTransformContext()

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

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
      // todo: 这个位移需要做一下scale适配，不然很难看
      runOnJS(updateUserTransform)({
        x: userTransform.x - translateX.value,
        y: userTransform.y - translateY.value,
        resolution: userTransform.resolution,
      })
      // 重置canvas位置
      translateX.value = 0
      translateY.value = 0
    })

  const tapGesture = Gesture.Tap().onEnd((_event, success) => {
    if (success) {
      console.log('single tap!')
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
   * 更新坐标变换矩阵
   * @param transforms
   */
  const updateTransforms = (
    transforms: {
      transform: Transform
      child_frame_id: string
      [key: string]: any
    }[],
  ) => {
    transforms?.forEach(transform => {
      updateTransform(transform.child_frame_id, transform.transform)
    })
  }

  /**
   * 处理tf_static的信息
   */
  const tfStaticHandler = async (
    op: any,
    subscriptionId: number,
    timestamp: number,
    data: any,
  ) => {
    const parseData: any = await dispatch(
      readMsgWithSubId(subscriptionId, data),
    )
    updateTransforms(parseData.transforms)
  }

  /**
   * 订阅必须topic
   * tf: 更新baseFootprintToOdom,leftWheelToBaseLink,rightWheelToBaseLink,odomToMap(导航模式下)
   * tf_static: 更新laserLinkToBaseLink, baseLinkToBaseFootprint
   */
  const subscribeTopics = () => {
    // 切换到导航模式
    dispatch(
      callService('/tiered_nav_state_machine/switch_mode', {
        mode: 2,
      }),
    )
    // 更新小车定位，这里传入updateViewOrigin是为了让窗口跟随小车移动
    subscribeCarPosition()
    dispatch(subscribeTopic('/tf_static'))
      .then((res: any) => {
        dispatch(listenMessage('/tf_static', tfStaticHandler))
      })
      .catch((err: any) => {
        rosLog.error('subscribe topic tf_static error:', err)
      })
  }

  useEffect(() => {
    fetchImageData().then(subscribeTopics)
    return () => {
      unsubscribeCarPostition()
    }
  }, [drawingMap])

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.mapContainer}>
        <GestureDetector gesture={composedEvent}>
          <Animated.View style={[animatedStyle]}>
            <Canvas style={{ width, height }}>
              <Image
                image={viewImage}
                fit='contain'
                x={0}
                y={0}
                width={1000}
                height={600}
              />
              <LaserPointAtlas laserPoints={displayLaser} />
              <CarIcon carPosition={carPosition} />
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
  mapContainer: { width: 1000, height: 600, overflow: 'hidden' },
})
