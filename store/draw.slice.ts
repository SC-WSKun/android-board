import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './store'
import { update } from 'lodash'

type NavigationView = 'label' | 'select-map' | 'navigation'

type TapMethod = 'POINTER' | 'REDIRECT' | 'NAVIGATION'

type LaserPoints = any[]

type UserTransform = {
  resolution: number
  x: number
  y: number
}

export type PlanPose = {
  header: Header
  pose: {
    position: {
      x: number
      y: number
      z: number
    }
    orientation: Quaternion
  }
}

export interface DrawState {
  mapHasInit: boolean
  // 导航视图, 默认为选择地图
  currentView: NavigationView
  // 当前绘制的地图名字等信息
  drawingMap: RobotMap | undefined
  laserPoints: LaserPoints
  // 中心点map坐标
  centerPoint: {
    x: number
    y: number
  }
  // 当前绘制的地图详细信息
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
  // 用户拖拽与缩放参数
  userTransform: UserTransform
  // 区分地图点击模式
  tapMethod: TapMethod
  // 导航点
  routePoints: PlanPose[]
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
  tapMethod: 'POINTER',
  routePoints: [],
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
    updateTapMethod(state, action: PayloadAction<TapMethod>) {
      state.tapMethod = action.payload
    },
    updateRoutePoints(state, action: PayloadAction<PlanPose[]>) {
      state.routePoints = action.payload
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
  updateTapMethod,
  updateRoutePoints,
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
  const tapMethod = useSelector((state: RootState) => state.draw.tapMethod)
  const routePoints = useSelector((state: RootState) => state.draw.routePoints)

  return {
    mapInfo,
    userTransform,
    laserPoints,
    centerPoint,
    mapHasInit,
    currentView,
    drawingMap,
    tapMethod,
    routePoints,
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
    updateTapMethod: (newTapMethod: TapMethod) =>
      dispatch(updateTapMethod(newTapMethod)),
    updateRoutePoints: (newRoutePoints: PlanPose[]) =>
      dispatch(updateRoutePoints(newRoutePoints)),
  }
}
