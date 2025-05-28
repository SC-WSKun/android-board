import { useState } from 'react'
import _ from 'lodash'
import { useDispatch } from 'react-redux'
import store, { AppDispatch } from '@/store/store'
import {
  callService,
  listenMessage,
  readMsgWithSubId,
  subscribeTopic,
  unSubscribeTopic,
} from '@/store/foxglove.trunk'
import { BaseFootprintToMap } from '@/utils/coodinate'
import { useTransformContext } from '@/store/transform.slice'
import { carLog } from '@/log/logger'

export type CarPosition = {
  x: number
  y: number
  yaw: number
}

export function useCar() {
  const dispatch = useDispatch<AppDispatch>()
  const { updateTransform } = useTransformContext()
  // 小车的map坐标
  const [carPosition, updateCarPosition] = useState<CarPosition>({
    x: 0,
    y: 0,
    yaw: 0,
  })

  /**
   * 订阅小车位置
   */
  const subscribeCarPosition = () => {
    carLog.info('start subscribe car position')
    /**
     * 处理小车Topic信息，更新小车定位
     * 这里是根据坐标系之间的transform算出来的，最后得到的是map坐标系下resolution为1的坐标
     */
    const msgHandler = _.throttle(
      async (op: any, subscriptionId: number, timestamp: number, data: any) => {
        try {
          const parseData: any = await dispatch(
            readMsgWithSubId(subscriptionId, data),
          )
          if (!parseData) throw new Error('parse tf msg is null')

          const { transforms } = parseData
          if (transforms) {
            updateTransforms(transforms)
          }
          const state = store.getState()
          const odomToMap = state.transform.odomToMap
          const baseFootprintToOdom = state.transform.baseFootprintToOdom
          const mapPosition = BaseFootprintToMap(odomToMap, baseFootprintToOdom)
          if (!mapPosition) throw new Error('mapPosition is null')
          updateCarPosition(mapPosition)
        } catch (err) {
          carLog.debug('parse tf msg error:', err)
        }
      },
      100,
    )

    dispatch(subscribeTopic('/tf'))
      .then(() => {
        dispatch(listenMessage('/tf', msgHandler))
      })
      .catch((err: any) => {
        carLog.error('subscribe topic tf error:', err)
      })
  }

  /**
   * 移除订阅小车位置
   */
  const unsubscribeCarPostition = () => {
    dispatch(unSubscribeTopic('/tf'))
  }

  /**
   * 重定位小车
   * 坐标需要传map坐标系的坐标
   */
  const resetCarPosition = (map_name: string, newTransform: Transform) => {
    carLog.info(
      `reset car position to translation ${JSON.stringify(newTransform.translation)}, rotation:${JSON.stringify(newTransform.rotation)}`,
    )
    dispatch(
      callService('/tiered_nav_state_machine/load_map', {
        p: {
          map_name,
          t: newTransform,
        },
      }),
    )
  }

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

  return {
    carPosition,
    subscribeCarPosition,
    unsubscribeCarPostition,
    resetCarPosition,
  }
}
