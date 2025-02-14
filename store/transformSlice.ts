import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './store'
import { TRANSFORM_MAP } from '@/constants/TransformMap'

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
        transformType: keyof TransformState
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
  const dispatch = useDispatch()
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

  return {
    odomToMap,
    baseFootprintToOdom,
    baseLinkToBaseFootprint,
    baseScanToBaseLink,
    laserLinkToBaseLink,
    updateTransform: (transformType: keyof TransformState, value: Transform) =>
      dispatch(updateTransform({ transformType, value })),
  }
}
