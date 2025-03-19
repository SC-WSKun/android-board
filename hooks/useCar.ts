import { useState } from 'react'
import _ from 'lodash'
import { useDispatch } from 'react-redux'
import store, { AppDispatch } from '@/store/store'
import {
  listenMessage,
  readMsgWithSubId,
  subscribeTopic,
  unSubscribeTopic,
} from '@/store/foxglove.trunk'
import { BaseFootprintToMap, mapToCanvas } from '@/utils/coodinate'
import { useTransformContext } from '@/store/transform.slice'
import { carLog } from '@/log/logger'

export type CarPosition = {
  x: number
  y: number
  yaw: number
}

export function useCar() {
  // map视图下小车的原坐标（resolution = 1）
  const [carPosition, updateCarPosition] = useState<CarPosition>({
    x: 0,
    y: 0,
    yaw: 0,
  })
  const { updateTransform } = useTransformContext()
  const dispatch = useDispatch<AppDispatch>()
  /**
   * 订阅小车位置
   */
  const subscribeCarPosition = () => {
    carLog.info('start subscribe car position')
    dispatch(subscribeTopic('/tf'))
      .then((subId: number) => {
        dispatch(listenMessage('/tf', msgHandler))
      })
      .catch((err: any) => {
        carLog.error('[RobotMap] subscribe topic tf error:', err)
      })

    /**
     * 处理小车Topic信息
     */
    const msgHandler = _.throttle(
      async (op: any, subscriptionId: number, timestamp: number, data: any) => {
        const parseData: any = await dispatch(
          readMsgWithSubId(subscriptionId, data),
        )
        if (!parseData) return

        const { transforms } = parseData
        if (transforms) {
          updateTransforms(transforms)
        }
        const state = store.getState()
        const odomToMap = state.transform.odomToMap
        const baseFootprintToOdom = state.transform.baseFootprintToOdom
        const mapPosition = BaseFootprintToMap(odomToMap, baseFootprintToOdom)
        if (!mapPosition) return
        const newPosition = {
          ...mapToCanvas(mapPosition.x, mapPosition.y),
          yaw: mapPosition.yaw,
        }
        newPosition.x -= state.draw.userTransform.x
        newPosition.y -= state.draw.userTransform.y
        updateCarPosition(newPosition)
      },
      500,
    )
  }

  /**
   * 移除订阅小车位置
   */
  const unsubscribeCarPostition = () => {
    dispatch(unSubscribeTopic('/tf'))
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
  }
}
