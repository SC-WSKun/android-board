import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from './store'
import { TRANSFORM_MAP } from '@/constants/TransformMap'
import { rosLog } from '@/log/logger'
import {
  listenMessage,
  readMsgWithSubId,
  subscribeTopic,
  unSubscribeTopic,
} from './foxglove.trunk'

export type TransformState = {
  odomToMap: Transform | null
  baseFootprintToOdom: Transform | null
  baseLinkToBaseFootprint: Transform | null
  baseScanToBaseLink: Transform | null
  imuLinkToBaseLink: Transform | null
  laserLinkToBaseLink: Transform | null
  leftWheelToBaseLink: Transform | null
  rightWheelToBaseLink: Transform | null
}

const initialState: TransformState = {
  odomToMap: null,
  baseFootprintToOdom: null,
  baseLinkToBaseFootprint: null,
  baseScanToBaseLink: null,
  imuLinkToBaseLink: null,
  laserLinkToBaseLink: null,
  leftWheelToBaseLink: null,
  rightWheelToBaseLink: null,
}

const transformSlice = createSlice({
  name: 'transform',
  initialState,
  reducers: {
    updateTransform(
      state,
      action: PayloadAction<{
        transformType: string
        value: Transform
      }>,
    ) {
      state[TRANSFORM_MAP[action.payload.transformType]] = action.payload.value
    },
  },
})

export const { updateTransform } = transformSlice.actions
export default transformSlice.reducer

export function useTransformContext() {
  const dispatch = useDispatch<AppDispatch>()
  const odomToMap = useSelector((state: RootState) => state.transform.odomToMap)
  const baseFootprintToOdom = useSelector(
    (state: RootState) => state.transform.baseFootprintToOdom,
  )
  const baseLinkToBaseFootprint = useSelector(
    (state: RootState) => state.transform.baseLinkToBaseFootprint,
  )
  const baseScanToBaseLink = useSelector(
    (state: RootState) => state.transform.baseScanToBaseLink,
  )
  const laserLinkToBaseLink = useSelector(
    (state: RootState) => state.transform.laserLinkToBaseLink,
  )

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
      dispatch(
        updateTransform({
          transformType: transform.child_frame_id,
          value: transform.transform,
        }),
      )
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

  const subscribeTransforms = () => {
    dispatch(subscribeTopic('/tf_static'))
      .then((res: any) => {
        dispatch(listenMessage('/tf_static', tfStaticHandler))
      })
      .catch((err: any) => {
        rosLog.error('subscribe topic tf_static error:', err)
      })
  }

  const unsubscribeTransforms = () => {
    dispatch(unSubscribeTopic('/tf_static'))
  }

  return {
    odomToMap,
    baseFootprintToOdom,
    baseLinkToBaseFootprint,
    baseScanToBaseLink,
    laserLinkToBaseLink,
    updateTransform: (transformType: string, value: Transform) =>
      dispatch(updateTransform({ transformType, value })),
    subscribeTransforms,
    unsubscribeTransforms,
  }
}
