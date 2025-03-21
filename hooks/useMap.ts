import { mapLog } from '@/log/logger'
import { useDrawContext } from '@/store/draw.slice'
import { callService } from '@/store/foxglove.trunk'
import store, { AppDispatch } from '@/store/store'
import { AlphaType, ColorType, Skia } from '@shopify/react-native-skia'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'

const VIEW_WIDTH = 1000 // canvas宽度
const VIEW_HEIGHT = 600 // canvas高度

type ViewOrigin = {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function useMap() {
  const dispatch = useDispatch<AppDispatch>()
  const { mapInfo, userTransform, drawingMap, updateMapInfo } = useDrawContext()
  const [viewOrigin, setViewOrigin] = useState<ViewOrigin>({
    startX: 0,
    startY: 0,
    endX: 1000,
    endY: 600,
  })
  const [mapData, setMapData] = useState<Uint8Array>()

  // 坐标计算：
  // (originX, originY) * resolution -> (x,y)[resolution = 1]
  // (x,y)[resolution = 1] / viewResolution -> (x,y)[resolution = viewResolution]
  // 这里因为已知viewResolution的坐标，所以要进行反推
  const viewImage = useMemo(() => {
    if (!mapInfo || !mapData || !viewOrigin) return null
    const pixels = new Uint8Array(VIEW_WIDTH * VIEW_HEIGHT * 4) // 初始化像素数组
    const scale = userTransform.resolution / mapInfo.resolution

    // 填充 pixels 数组
    for (let row = 0; row < VIEW_HEIGHT; row++) {
      for (let col = 0; col < VIEW_WIDTH; col++) {
        // targetCol 和 targetRow 转换到了原始map的resolution下的坐标
        const targetCol = Math.ceil((col + viewOrigin.startX) * scale)
        const targetRow = Math.ceil((row + viewOrigin.startY) * scale)

        // 如果超出边界，则填充为灰色
        if (
          targetCol < 0 ||
          targetRow < 0 ||
          targetCol >= mapInfo?.width ||
          targetRow >= mapInfo?.height
        ) {
          const i = (col + row * VIEW_WIDTH) * 4
          const color = 127
          pixels[i] = color
          pixels[i + 1] = color
          pixels[i + 2] = color
          pixels[i + 3] = 255
          continue
        }

        // 从mapData中获取值
        const mapI =
          targetCol + (mapInfo?.height - 1 - targetRow) * mapInfo?.width
        const val = mapData[mapI]
        const i = (col + row * VIEW_WIDTH) * 4
        const color = val === 100 ? 0 : 236
        pixels[i] = color
        pixels[i + 1] = color
        pixels[i + 2] = color
        pixels[i + 3] = 255
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
  }, [viewOrigin, mapInfo.resolution, userTransform.resolution])

  /**
   * 拉取地图信息
   */
  const fetchImageData = async () => {
    mapLog.info('start fetching map')
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
        setMapData(res.map.data)
        updateMapInfo(res.map.info) // 这里传到store是因为计算transform的时候需要用到这个信息
        updateViewOrigin(res.map.info.origin.position)
        return Promise.resolve()
      } else {
        throw new Error('Map data is undefined')
      }
    } catch (error) {
      mapLog.error(`Error fetching map ${drawingMap.map_name} data:`, error)
      return Promise.reject(error)
    }
  }

  /**
   * 根据中心位置计算屏幕显示的局部区域位置
   * @param centerPosition 小车在map下的坐标
   * originWidth / resolution -> standardWdith
   * standardWdith * viewResolution -> viewWidth
   */
  const updateViewOrigin = (centerPosition: { x: number; y: number }) => {
    const { mapInfo } = store.getState().draw
    if (!mapInfo) return

    const startX = centerPosition.x - VIEW_WIDTH / 2
    const startY = centerPosition.y - VIEW_HEIGHT / 2
    const endX = startX + VIEW_WIDTH
    const endY = startY + VIEW_HEIGHT

    // 仅在位置发生变化时更新状态
    if (startX !== viewOrigin?.startX || startY !== viewOrigin.startY) {
      setViewOrigin({ startX, startY, endX, endY })
    }
  }

  /**
   * 拖拽触发更新视图中心
   * newOrigin: view center point in userScale
   */
  useEffect(() => {
    const scale = mapInfo.resolution / userTransform.resolution
    const newOrigin = {
      x: mapInfo.origin.position.x * scale + userTransform.x,
      y: mapInfo.origin.position.y * scale + userTransform.y,
    }
    updateViewOrigin(newOrigin)
  }, [mapInfo, userTransform])

  return {
    viewOrigin,
    viewImage,
    fetchImageData,
    updateViewOrigin,
  }
}
