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
import { update } from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { View, Text, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
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

const INFO_ICON: { [key: string]: string } = {
  // imu: 'IMU' as const,
  batteryVoltage: 'battery-4' as const,
  // odometer: 'Odometer' as const,
  // joint: 'Joint' as const,
  // diagnostics: 'Diagnostics' as const,
}

interface IInfoCard {
  type: string
  value: any
}
function InfoCard(props: IInfoCard) {
  const { type, value } = props
  const iconName = INFO_ICON[type]
  let valueText = ''
  switch (type) {
    case 'batteryVoltage':
      valueText = Number(value.data).toFixed(2) + 'V'
  }
  return (
    <View key={iconName} style={[styles.card]}>
      <Icon name={iconName} size={30} color='#007bff' style={styles.cardIcon} />
      <Text style={styles.cardTitle} numberOfLines={1}>
        {JSON.stringify(valueText)}
      </Text>
    </View>
  )
}

export default function Status() {
  const dispatch = useDispatch<AppDispatch>()
  const InfoIds = useRef<any>(undefined)
  const [InfoValue, updateInfoValue] = useState<any>({
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
        updateInfoValue((prev: any) => {
          return {
            ...prev,
            imu: parseData,
          }
        })
        break
      }
      case InfoIds.current.batteryVoltageId: {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        updateInfoValue((prev: any) => {
          return {
            ...prev,
            batteryVoltage: parseData,
          }
        })
        break
      }
      case InfoIds.current.odometerId: {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        updateInfoValue((prev: any) => {
          return {
            ...prev,
            odometer: parseData,
          }
        })
        break
      }
      case InfoIds.current.jointId: {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        updateInfoValue((prev: any) => {
          return {
            ...prev,
            joint: parseData,
          }
        })
        break
      }
      case InfoIds.current.diagnosticsId: {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        updateInfoValue((prev: any) => {
          return {
            ...prev,
            diagnostics: parseData,
          }
        })
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
      {Object.keys(INFO_ICON).map(key => {
        return <InfoCard key={key} type={key} value={InfoValue[key]} />
      })}
    </ImageContainer>
  )
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 30,
    marginBottom: 20,
    elevation: 3, // 添加阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 15,
    paddingTop: 5,
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    width: '55%',
  },
})
