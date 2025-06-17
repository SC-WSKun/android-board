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
import { View, Text, StyleSheet } from 'react-native'
import { useDispatch } from 'react-redux'

/**
 * 状态页面
 * 目前感觉没必要把这些状态扔到redux里面，这些数据其他页面用不上
 */
const INFO_TOPICS = {
  IMU: '/szarbot_control/imu_data',
  BATTERY_VOLTAGE: '/szarbot_control/battery_voltage',
  ODOMETRY: '/odometry/filtered',
  JOINT: '/joint_states',
  DIAGNOSTICS: '/diagnostics',
}

const INFO_LABEL: { [key: string]: string } = {
  imu: 'IMU' as const,
  batteryVoltage: 'Battery Voltage' as const,
  odometer: 'Odometer' as const,
  joint: 'Joint' as const,
  diagnostics: 'Diagnostics' as const,
}

interface IInfoCard {
  label: string
  value: any
}
function InfoCard(props: IInfoCard) {
  const { label, value } = props
  return (
    <View key={label} style={styles.infoCard}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  )
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
  return (
    <ImageContainer>
      {Object.keys(InfoValue).map(key => {
        console.log('render key', key)
        return (
          <InfoCard
            key={key}
            label={INFO_LABEL[key]}
            value={InfoValue.current[key]}
          />
        )
      })}
    </ImageContainer>
  )
}

const styles = StyleSheet.create({
  infoCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 14,
  },
})
