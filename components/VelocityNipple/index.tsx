import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import NativeNipple from '@/components/NativeNipple'
import { advertiseTopic, publishMessage } from '@/store/foxglove.trunk'
import { throttle } from 'es-toolkit'
import { useCallback, useEffect, useRef } from 'react'
import { View } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const CMD_VEL_TOPIC = '/cmd_vel'
const CMD_VEL_CONFIG = {
  topic: CMD_VEL_TOPIC,
  encoding: 'cdr',
  schemaName: 'geometry_msgs/msg/Twist',
  schema:
    '# This expresses velocity in free space broken into its linear and angular parts.\nVector3  linear\nVector3  angular\n\n================================================================================\nMSG: geometry_msgs/Vector3\n# This represents a vector in free space. \n# It is only meant to represent a direction. Therefore, it does not\n# make sense to apply a translation to it (e.g., when applying a \n# generic rigid transformation to a Vector3, tf2 will only apply the\n# rotation). If you want your data to be translatable too, use the\n# geometry_msgs/Point message instead.\n\nfloat64 x\nfloat64 y\nfloat64 z',
  schemaEncoding: 'ros2msg',
}

const VELOCITY_EFF = 0.5
const ANGULAR_EFF = 1
export default function VelocityNipple() {
  const dispatch = useDispatch<AppDispatch>()
  const vectorRef = useRef<VelocityControlVec>({
    linear: {
      x: 0,
      y: 0,
      z: 0,
    },
    angular: {
      x: 0,
      y: 0,
      z: 0,
    },
  })
  useEffect(() => {
    dispatch(advertiseTopic(CMD_VEL_CONFIG))
    console.log('register cmd_vel topic')
  }, [dispatch])

  const handleVelUpdate = throttle(
    useCallback(
      (data: { x: number; y: number }) => {
        vectorRef.current = {
          ...vectorRef.current,
          linear: {
            x: -data.y * VELOCITY_EFF,
            y: 0,
            z: 0,
          },
        }
        dispatch(publishMessage('/cmd_vel', vectorRef.current))
      },
      [dispatch],
    ),
    30,
  )
  const handleAngleUpdate = throttle(
    useCallback(
      (data: { x: number; y: number }) => {
        vectorRef.current = {
          ...vectorRef.current,
          angular: {
            x: 0,
            y: 0,
            z: -data.x * ANGULAR_EFF,
          },
        }
        dispatch(publishMessage('/cmd_vel', vectorRef.current))
      },
      [dispatch],
    ),
    30,
  )

  return (
    <GestureHandlerRootView>
      <View
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <NativeNipple radius={72} onUpdate={handleVelUpdate} lock='x' />
        <NativeNipple radius={72} onUpdate={handleAngleUpdate} lock='y' />
      </View>
    </GestureHandlerRootView>
  )
}
