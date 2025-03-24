import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './store'

type NavigationView = 'label' | 'select-map' | 'navigation'

type LaserPoints = any[]

type UserTransform = {
  resolution: number
  x: number
  y: number
}

export interface DrawState {
  mapHasInit: boolean
  currentView: NavigationView
  drawingMap: RobotMap | undefined
  laserPoints: LaserPoints
  // 中心点map坐标
  centerPoint: {
    x: number
    y: number
  }
  mapInfo: {
    width: number
    height: number
    origin: {
      position: {
        x: number
        y: number
      }
    }
    resolution: number
  }
  userTransform: UserTransform
}

const initialState: DrawState = {
  mapHasInit: false,
  currentView: 'select-map',
  drawingMap: undefined,
  laserPoints: [],
  centerPoint: {
    x: 0,
    y: 0,
  },
  mapInfo: {
    width: 1000,
    height: 600,
    origin: {
      position: {
        x: 0,
        y: 0,
      },
    },
    resolution: 1,
  },
  userTransform: {
    resolution: 0.0125,
    x: 0,
    y: 0,
  },
}

const drawSlice = createSlice({
  name: 'draw',
  initialState,
  reducers: {
    setMapInit(state, action: PayloadAction<boolean>) {
      state.mapHasInit = action.payload
    },
    setCurrentView(state, action: PayloadAction<NavigationView>) {
      state.currentView = action.payload
    },
    changeMap(state, action: PayloadAction<RobotMap>) {
      state.drawingMap = action.payload
    },
    updateLaserPoints(state, action: PayloadAction<LaserPoints>) {
      state.laserPoints = action.payload
    },
    updateMapInfo(
      state,
      action: PayloadAction<{
        width: number
        height: number
        origin: { position: { x: number; y: number } }
        resolution: number
      }>,
    ) {
      state.mapInfo = action.payload
    },
    updateUserTransform(state, action: PayloadAction<UserTransform>) {
      state.userTransform = action.payload
    },
    updateCenterPoint(state, action: PayloadAction<{ x: number; y: number }>) {
      state.centerPoint = action.payload
    },
  },
})

export const {
  setMapInit,
  setCurrentView,
  changeMap,
  updateLaserPoints,
  updateMapInfo,
  updateUserTransform,
  updateCenterPoint,
} = drawSlice.actions
export default drawSlice.reducer

export function useDrawContext() {
  const dispatch = useDispatch()
  const mapInfo = useSelector((state: RootState) => state.draw.mapInfo)
  const userTransform = useSelector(
    (state: RootState) => state.draw.userTransform,
  )
  const centerPoint = useSelector((state: RootState) => state.draw.centerPoint)
  const laserPoints = useSelector((state: RootState) => state.draw.laserPoints)
  const mapHasInit = useSelector((state: RootState) => state.draw.mapHasInit)
  const currentView = useSelector((state: RootState) => state.draw.currentView)
  const drawingMap = useSelector((state: RootState) => state.draw.drawingMap)

  return {
    mapInfo,
    userTransform,
    laserPoints,
    centerPoint,
    mapHasInit,
    currentView,
    drawingMap,
    changeMap: (map: RobotMap) => dispatch(changeMap(map)),
    setCurrentView: (view: NavigationView) => dispatch(setCurrentView(view)),
    updateLaserPoints: (points: LaserPoints) =>
      dispatch(updateLaserPoints(points)),
    updateMapInfo: (mapInfo: {
      width: number
      height: number
      origin: { position: { x: number; y: number } }
      resolution: number
    }) => dispatch(updateMapInfo(mapInfo)),
    updateUserTransform: (newTransform: UserTransform) =>
      dispatch(updateUserTransform(newTransform)),
    updateCenterPoint: (newcenterPoint: { x: number; y: number }) =>
      dispatch(updateCenterPoint(newcenterPoint)),
  }
}
