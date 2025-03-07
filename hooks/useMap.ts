import { useDrawContext } from '@/store/draw.slice'
import { callService } from '@/store/foxglove.trunk'
import { AppDispatch } from '@/store/store'
import { AlphaType, ColorType, Skia } from '@shopify/react-native-skia'
import { useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

const VIEW_WIDTH = 1000 // canvas宽度
const VIEW_HEIGHT = 600 // canvas高度

const initMapInfo = {
  width: VIEW_WIDTH,
  height: VIEW_HEIGHT,
  resolution: 1,
  origin: {
    position: {
      x: 0,
      y: 0,
      z: 0,
    },
    orientation: {
      w: 0,
      x: 0,
      y: 0,
      z: 0,
    },
  },
  map_load_time: {
    nanosec: 0,
    sec: 0,
  },
}

type ViewOrigin = {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function useMap() {
  const dispatch = useDispatch<AppDispatch>()
  const { drawingMap, updateMapInfo } = useDrawContext()
  const [viewOrigin, setViewOrigin] = useState<ViewOrigin>()
  const [mapInfo, setMapInfo] = useState<MapInfo>(initMapInfo)
  const [mapData, setMapData] = useState<Uint8Array>()
  const [viewResolution, setViewResolution] = useState<number>(0.25) // 视图放大参数，表示1像素多少米

  const viewImage = useMemo(() => {
    if (!mapInfo || !mapData || !viewOrigin) return null
    const pixels = new Uint8Array(VIEW_WIDTH * VIEW_HEIGHT * 4) // 初始化像素数组

    // 填充 pixels 数组
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      for (let col = 0; col < VIEW_WIDTH; col++) {
        const scale = viewResolution / mapInfo.resolution
        const targetCol = Math.ceil(col * scale) + viewOrigin.startX
        const targetRow = Math.ceil(row * scale) + viewOrigin.startY
        const mapI =
          targetCol + (mapInfo?.height - 1 - targetRow) * mapInfo?.width
        const val = mapData[mapI]
        const i = (col + row * VIEW_WIDTH) * 4

        // 设置 RGBA 值
        const color = val === 100 ? 0 : val === 0 ? 236 : 127
        pixels[i] = color
        pixels[i + 1] = color
        pixels[i + 2] = color
        pixels[i + 3] = 236
      }
    }

    // 二进制转 Skia Image
    const data = Skia.Data.fromBytes(pixels)
    const img = Skia.Image.MakeImage(
      {
        width: VIEW_WIDTH,
        height: VIEW_HEIGHT,
        alphaType: AlphaType.Opaque,
        colorType: ColorType.RGBA_8888,
      },
      data,
      VIEW_WIDTH * 4,
    )
    return img
  }, [viewOrigin, mapInfo.resolution, viewResolution])

  /**
   * 拉取地图信息
   */
  const fetchImageData = async () => {
    console.log('[useMap] start fetching data')
    if (!drawingMap) {
      return Promise.reject('drawingMap is undefined')
    }
    try {
      const res: any = await dispatch(
        callService('/tiered_nav_state_machine/get_grid_map', {
          info: drawingMap,
        }),
      )
      if (res?.map?.info) {
        setMapInfo(res.map.info)
        setMapData(res.map.data)
        updateMapInfo(res.map.info) // 这里传到store是因为计算transform的时候需要用到这个信息
        return Promise.resolve()
      } else {
        throw new Error('Map data is undefined')
      }
    } catch (error) {
      console.error(
        `[useMap] Error fetching map ${drawingMap.map_name} data:`,
        error,
      )
      return Promise.reject(error)
    }
  }

  /**
   * 根据小车位置计算屏幕显示的局部区域位置
   * @param carPosition 小车在map下的坐标
   */
  const updateViewOrigin = (carPosition: { x: number; y: number }) => {
    if (!mapInfo) return

    const resolution = mapInfo.resolution
    const viewWidthPx = VIEW_WIDTH * resolution
    const viewHeightPx = VIEW_HEIGHT * resolution

    // 计算视图区域，让小车保持在中心
    const startX = Math.ceil(
      Math.min(
        Math.max(carPosition.x - viewWidthPx / 2, 0),
        mapInfo.width - viewWidthPx,
      ),
    )
    const startY = Math.ceil(
      Math.min(
        Math.max(carPosition.y - viewHeightPx / 2, 0),
        mapInfo.height - viewHeightPx,
      ),
    )
    const endX = startX + viewWidthPx
    const endY = startY + viewHeightPx

    // 仅在位置发生变化时更新状态
    if (startX !== viewOrigin?.startX || startY !== viewOrigin.startY) {
      setViewOrigin({ startX, startY, endX, endY })
    }
  }

  return {
    viewImage,
    fetchImageData,
    updateViewOrigin,
  }
}
