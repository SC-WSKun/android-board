import { useDrawContext } from '@/store/draw.slice'
import {
  listenMessage,
  readMsgWithSubId,
  subscribeTopic,
  unSubscribeTopic,
} from '@/store/foxglove.trunk'
import store, { AppDispatch } from '@/store/store'
import { applyTransform } from '@/utils/coodinate'
import { transformPointCloud } from '@/utils/laserPoint'
import { useState } from 'react'
import { useDispatch } from 'react-redux'

export function useLaser() {
  const dispatch = useDispatch<AppDispatch>()
  const [displayLaser, setDisplayLaser] = useState<any[]>([])
  const { updateLaserPoints } = useDrawContext()
  /**
   * 激光点云回调
   */
  const laserPointHandler = async (
    op: any,
    subscriptionId: number,
    timestamp: number,
    data: any,
  ) => {
    const parseData: any = await dispatch(
      readMsgWithSubId(subscriptionId, data),
    )
    let laserFrame = parseData.header.frame_id
    let points = transformPointCloud(parseData)
    let transformedPoints = getPositionWithFrame(laserFrame, points)
    if (transformedPoints) {
      updateLaserPoints(transformedPoints)
    }
  }

  /**
   * 点云坐标系映射到map(世界坐标)
   * laser_link -> base_link -> base_foot_print -> odom -> map
   */
  const getPositionWithFrame = (
    frame_id: string,
    points: { x: number; y: number }[],
  ): { x: number; y: number }[] | null => {
    if (!frame_id) return null
    return points.map(position => {
      // 这里在ws的回调中调用的，非react组件不能直接获得react的状态，所以要用store.getState
      const state = store.getState()
      const laserLinkToBaseLink = state.transform.laserLinkToBaseLink
      const baseLinkToBaseFootprint = state.transform.baseLinkToBaseFootprint
      const baseFootprintToOdom = state.transform.baseFootprintToOdom
      const odomToMap = state.transform.odomToMap
      let tmp: any = position
      tmp = applyTransform(position, laserLinkToBaseLink)
      tmp = applyTransform(tmp, baseLinkToBaseFootprint)
      tmp = applyTransform(tmp, baseFootprintToOdom)
      tmp = applyTransform(tmp, odomToMap)
      return tmp
    })
  }

  const subscribeLaser = () => {
    dispatch(subscribeTopic('/scan'))
      .then((res: any) => {
        dispatch(listenMessage('/scan', laserPointHandler))
      })
      .catch((err: any) => {
        console.error('[RobotMap] subscribe topic scan error:', err)
      })
    function updateLaserPoint() {
      setTimeout(() => {
        const state = store.getState()
        const mapHasInit = state.draw.mapHasInit
        if (mapHasInit) {
          const laserPoints = state.draw.laserPoints
          setDisplayLaser(laserPoints)
        }
        updateLaserPoint()
      }, 250)
    }
    updateLaserPoint()
  }

  const unSubscribeLaser = () => {
    dispatch(unSubscribeTopic('/scan'))
  }

  return {
    displayLaser,
    subscribeLaser,
    unSubscribeLaser,
  }
}
