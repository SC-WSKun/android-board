import ImageContainer from '@/components/ui/ImageContainer'
import { rosLog } from '@/log/logger'
import {
  listenMessage,
  readMsgWithSubId,
  subscribeTopic,
  unSubscribeTopic,
} from '@/store/foxglove.trunk'
import { AppDispatch } from '@/store/store'
import { MessageData } from '@foxglove/ws-protocol'
import { useEffect, useRef, useState } from 'react'
import { useDispatch } from 'react-redux'

/**
 * 状态页面
 * 目前来看
 */

const INFO_TOPICS = {
  IMU: '/szarbot_control/imu_data',
  BATTERY_VOLTAGE: '/szarbot_control/battery_voltage',
  ODOMETRY: '/odometry/filtered',
  JOINT: '/joint_states',
  DIAGNOSTICS: '/diagnostics',
}

export default function Status() {
  const dispatch = useDispatch<AppDispatch>()
  const InfoIds = useRef<any>(undefined)
  const InfoValue = useRef<any>({
    imu: {},
    batteryVoltage: {},
    odometer: {},
    joint: {},
    diagnostics: {},
  })

  /**
   * 处理状态信息
   * @param object msg header
   */
  const statusMsgHandler = async ({
    op,
    subscriptionId,
    timestamp,
    data,
  }: MessageData) => {
    switch (subscriptionId) {
      case InfoIds.current.imuId: {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        InfoValue.current.imu = parseData
        break
      }
      case InfoIds.current.batteryVoltageId: {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        InfoValue.current.batteryVoltage = parseData
        break
      }
      case InfoIds.current.odometerId: {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        InfoValue.current.odometer = parseData
        break
      }
      case InfoIds.current.jointId: {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        InfoValue.current.joint = parseData
        break
      }
      case InfoIds.current.diagnosticsId: {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        InfoValue.current.diagnostics = parseData
        break
      }
    }
  }
  const subStatusTopics = async () => {
    Promise.all(
      Object.values(INFO_TOPICS).map(topic => dispatch(subscribeTopic(topic))),
    )
      .then(res => {
        const [imuId, batteryVoltageId, odometerId, jointId, diagnosticsId] =
          res
        InfoIds.current = {
          imuId,
          batteryVoltageId,
          odometerId,
          jointId,
          diagnosticsId,
        }
        listenMessage(statusMsgHandler)
      })
      .catch(error => {
        rosLog.error('subscribe robot info error:', error)
      })
  }
  const unSubStatusTopics = () => {
    Promise.all(
      Object.values(INFO_TOPICS).map(topic =>
        dispatch(unSubscribeTopic(topic)),
      ),
    )
      .then(() => {
        InfoIds.current = undefined
      })
      .catch(error => {
        rosLog.error('unsubscribe robot info error:', error)
      })
  }

  useEffect(() => {
    subStatusTopics()
    return () => {
      unSubStatusTopics()
    }
  }, [])
  return <ImageContainer>{}</ImageContainer>
}
