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
  mapImage: any
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
  mapImage: undefined,
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
    updateMapImage(
      state,
      action: PayloadAction<{
        width: number
        height: number
        mapWidth: number
        mapHeight: number
        resolution: number
        mapData: any // 这里mapData要用base64，因为直接传二进制数据redux会因为不能序列化数据而报错（现在把检查二进制的middleware关了，不过保险起见还是转一下）
      }>,
    ) {
      const width = action.payload.width
      const height = action.payload.height
      const mapWidth = action.payload.mapWidth
      const mapHeight = action.payload.mapHeight
      const binaryString = atob(action.payload.mapData) // base64 -> 二进制
      const mapData = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        mapData[i] = binaryString.charCodeAt(i)
      }
      const pixels = new Uint8Array(width * height * 4) // 初始化像素数组
      const widthScale = mapWidth / width
      const heightScale = mapHeight / height
      const mapScale = Math.min(widthScale, heightScale) // 计算缩放比例
      state.scale = mapScale

      // 填充 pixels 数组
      for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
          const targetCol = Math.ceil(mapScale * col)
          const targetRow = Math.ceil(mapScale * row)
          const mapI = targetCol + (mapHeight - 1 - targetRow) * mapWidth
          const val = mapData[mapI]
          const i = (col + row * width) * 4

          // 设置 RGBA 值
          const color = val === 100 ? 0 : val === 0 ? 236 : 127
          pixels[i] = color
          pixels[i + 1] = color
          pixels[i + 2] = color
          pixels[i + 3] = 236
        }
      }

      const data = Skia.Data.fromBytes(pixels)
      const img = Skia.Image.MakeImage(
        {
          width,
          height,
          alphaType: AlphaType.Opaque,
          colorType: ColorType.RGBA_8888,
        },
        data,
        width * 4,
      )

      state.mapImage = img
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
  updateMapImage,
  updateMapInfo,
} = drawSlice.actions
export default drawSlice.reducer

export function useDrawContext() {
  const dispatch = useDispatch()
  const laserPoints = useSelector((state: RootState) => state.draw.laserPoints)
  const mapHasInit = useSelector((state: RootState) => state.draw.mapHasInit)
  const currentView = useSelector((state: RootState) => state.draw.currentView)
  const drawingMap = useSelector((state: RootState) => state.draw.drawingMap)
  const mapImage = useSelector((state: RootState) => state.draw.mapImage)

  return {
    laserPoints,
    mapHasInit,
    currentView,
    drawingMap,
    mapImage,
    changeMap: (map: RobotMap) => dispatch(changeMap(map)),
    setCurrentView: (view: NavigationView) => dispatch(setCurrentView(view)),
    updateLaserPoints: (points: LaserPoints) =>
      dispatch(updateLaserPoints(points)),
    updateMapImage: (
      width: number,
      height: number,
      mapWidth: number,
      mapHeight: number,
      resolution: number,
      mapData: any,
    ) => {
      dispatch(
        updateMapImage({
          width,
          height,
          mapWidth,
          mapHeight,
          resolution,
          mapData,
        }),
      )
      dispatch(setMapInit(true))
    },
    updateMapInfo: (mapInfo: {
      width: number
      height: number
      origin: { position: { x: number; y: number } }
      resolution: number
    }) => dispatch(updateMapInfo(mapInfo)),
  }
}
