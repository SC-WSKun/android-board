import { View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming, } from 'react-native-reanimated'

/**
 * @brief Props for the NativeNipple component.
 * @param radius The radius of the outer circle of the nipple.
 * @param minActivationDistanceFactor The factor of the radius that the gesture needs to travel to activate. Defaults to 0.05.
 * @param onUpdate A callback function that is called when the nipple is moved. It receives an object with the x and y offset from the center.
 *        *---> x
 *        |
 *        v y
 */
export interface NativeNippleProps {
  radius: number
  minActivationDistanceFactor?: number
  onUpdate?: (data: { x: number; y: number }) => void
}

export default function NativeNipple(props: NativeNippleProps) {
  const { radius, minActivationDistanceFactor = 0.05, onUpdate } = props
  const outerSize = radius * 2
  const innerSize = radius

  const translateX = useSharedValue(0)
  const translateY = useSharedValue(0)

  const panGesture = Gesture.Pan()
    .minPointers(1)
    .maxPointers(1)
    .minDistance(radius * minActivationDistanceFactor)
    .onUpdate(event => {
      const distance = Math.sqrt(
        event.translationX * event.translationX +
          event.translationY * event.translationY,
      )

      const maxDistance = radius

      if (distance > maxDistance) {
        const angle = Math.atan2(event.translationY, event.translationX)
        translateX.value = maxDistance * Math.cos(angle)
        translateY.value = maxDistance * Math.sin(angle)
      } else {
        translateX.value = event.translationX
        translateY.value = event.translationY
      }
      if (onUpdate) {
        runOnJS(onUpdate)({ x: translateX.value, y: translateY.value })
      }
    })
    .onEnd(() => {
      translateX.value = withTiming(0, { duration: 100 })
      translateY.value = withTiming(0, { duration: 100 })
      if (onUpdate) {
        runOnJS(onUpdate)({ x: 0, y: 0 })
      }
    })

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }))

  return (
    <View
      style={{
        width: outerSize,
        height: outerSize,
        margin: radius / 2,
        borderRadius: radius,
        backgroundColor: 'rgba(0,0,0,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              width: innerSize,
              height: innerSize,
              borderRadius: innerSize / 2,
              backgroundColor: 'rgba(0,0,0,0.5)',
            },
            animatedStyle,
          ]}
        />
      </GestureDetector>
    </View>
  )
}
