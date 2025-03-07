import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './store'
import { AlphaType, ColorType, Skia } from '@shopify/react-native-skia'

type NavigationView = 'label' | 'select-map' | 'navigation'

type LaserPoints = any[]

export interface DrawState {
  mapHasInit: boolean
  currentView: NavigationView
  drawingMap: RobotMap | undefined
  laserPoints: LaserPoints
  scale: number
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
}

const initialState: DrawState = {
  mapHasInit: false,
  currentView: 'select-map',
  drawingMap: undefined,
  laserPoints: [],
  scale: 1,
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
  },
})

export const {
  setMapInit,
  setCurrentView,
  changeMap,
  updateLaserPoints,
  updateMapInfo,
} = drawSlice.actions
export default drawSlice.reducer

export function useDrawContext() {
  const dispatch = useDispatch()
  const mapInfo = useSelector((state: RootState) => state.draw.mapInfo)
  const laserPoints = useSelector((state: RootState) => state.draw.laserPoints)
  const mapHasInit = useSelector((state: RootState) => state.draw.mapHasInit)
  const currentView = useSelector((state: RootState) => state.draw.currentView)
  const drawingMap = useSelector((state: RootState) => state.draw.drawingMap)

  return {
    mapInfo,
    laserPoints,
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
  }
}
