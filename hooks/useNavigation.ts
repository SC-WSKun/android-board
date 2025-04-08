import { navLog } from '@/log/logger'
import {
  advertiseTopic,
  listenMessage,
  publishMessage,
  readMsgWithSubId,
  subscribeTopic,
  unSubscribeTopic,
} from '@/store/foxglove.trunk'
import { AppDispatch } from '@/store/store'
import { useDispatch } from 'react-redux'
import { PlanPose, useDrawContext } from '@/store/draw.slice'
import _ from 'lodash'

type GridPlan = {
  data: Uint8Array
  header: Header
  poses: PlanPose[]
}

const NAV_TOPIC = '/goal_pose'
const NAV_TOPIC_CONFIG = {
  encoding: 'cdr',
  schema:
    '# A Pose with reference coordinate frame and timestamp\n\nstd_msgs/Header header\nPose pose\n\n================================================================================\nMSG: geometry_msgs/Pose\n# A representation of pose in free space, composed of position and orientation.\n\nPoint position\nQuaternion orientation\n\n================================================================================\nMSG: geometry_msgs/Point\n# This contains the position of a point in free space\nfloat64 x\nfloat64 y\nfloat64 z\n\n================================================================================\nMSG: geometry_msgs/Quaternion\n# This represents an orientation in free space in quaternion form.\n\nfloat64 x 0\nfloat64 y 0\nfloat64 z 0\nfloat64 w 1\n\n================================================================================\nMSG: std_msgs/Header\n# Standard metadata for higher-level stamped data types.\n# This is generally used to communicate timestamped data\n# in a particular coordinate frame.\n\n# Two-integer timestamp that is expressed as seconds and nanoseconds.\nbuiltin_interfaces/Time stamp\n\n# Transform frame with which this data is associated.\nstring frame_id\n\n================================================================================\nMSG: builtin_interfaces/Time\n# This message communicates ROS Time defined here:\n# https://design.ros2.org/articles/clock_and_time.html\n\n# The seconds component, valid over all int32 values.\nint32 sec\n\n# The nanoseconds component, valid in the range [0, 1e9).\nuint32 nanosec\n',
  schemaEncoding: 'ros2msg',
  schemaName: 'geometry_msgs/msg/PoseStamped',
  topic: NAV_TOPIC,
}
let goalSeq = 0 // 导航点发布序号
export function useNavigation() {
  const dispatch = useDispatch<AppDispatch>()
  const { updateRoutePoints } = useDrawContext()

  /**
   * 发布导航话题
   * 主要用来注册channelId
   */
  const advertiseNavTopic = async () => {
    navLog.info('advertise navigation topic /goal_pose')
    await dispatch(advertiseTopic(NAV_TOPIC_CONFIG))
  }

  /**
   * 导航到目标点
   * 这里导航只指定目标点，不指定偏航角，默认朝向正北
   * @param targetX map坐标系下的x坐标
   * @param targetY map坐标系下的y坐标
   */
  const navigateToPosition = (targetX: number, targetY: number) => {
    navLog.info(`navigate to (${targetX}, ${targetY})`)
    const currentTime = Date.now()
    dispatch(
      publishMessage(NAV_TOPIC, {
        header: {
          seq: goalSeq++,
          stamp: {
            secs: Math.floor(currentTime / 1000),
            nsecs: (currentTime / 1000) * 1000000,
          },
          frame_id: 'map',
        },
        pose: {
          position: {
            x: targetX,
            y: targetY,
            z: 0,
          },
          orientation: {
            x: 0,
            y: 0,
            z: 0,
            w: 1,
          },
        },
      }),
    )
  }

  /**
   * 订阅导航路径与绑定回调
   */
  const subscribeCarRoute = async () => {
    navLog.info('subscribe navigation topic /plan')
    /**
     * 处理导航路径消息
     */
    const routeMsgHandler = _.throttle(
      async (op: any, subscriptionId: number, timestamp: number, data: any) => {
        const parseData = (await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )) as GridPlan
        if (!parseData) {
          navLog.debug('plan msg is null')
          return
        }
        updateRoutePoints(parseData.poses)
      },
      200,
    )
    dispatch(subscribeTopic('/plan'))
      .then(() => {
        dispatch(listenMessage('/plan', routeMsgHandler))
      })
      .catch(err => {
        navLog.error('subscribe topic /plan error:', err)
      })
  }

  /**
   * 解除订阅导航路径
   */
  const unsubscribeCarRoute = async () => {
    navLog.info('unsubscribe navigation topic /plan')
    await dispatch(unSubscribeTopic('/plan'))
  }

  return {
    advertiseNavTopic,
    navigateToPosition,
    subscribeCarRoute,
    unsubscribeCarRoute,
  }
}
