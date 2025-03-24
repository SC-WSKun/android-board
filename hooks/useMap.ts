import { mapLog } from '@/log/logger'
import { useDrawContext } from '@/store/draw.slice'
import { callService } from '@/store/foxglove.trunk'
import store, { AppDispatch } from '@/store/store'
import { AlphaType, ColorType, Skia } from '@shopify/react-native-skia'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '@/components/RobotMap'

type ViewRect = {
  startX: number
  startY: number
  endX: number
  endY: number
}

export function useMap() {
  const dispatch = useDispatch<AppDispatch>()
  const {
    mapInfo,
    userTransform,
    drawingMap,
    updateMapInfo,
    updateCenterPoint,
  } = useDrawContext()
  const [viewRect, setViewRect] = useState<ViewRect>({
    startX: 0,
    startY: 0,
    endX: 1000,
    endY: 600,
  })
  const [mapData, setMapData] = useState<Uint8Array>()

  /**
   * 渲染地图, 渲染地图的坐标是世界坐标
   * 已知经过userTransform变换的map坐标系下的中心点坐标，需要反推出原始地图的坐标映射
   * (x, y) * userTransform.resolution / mapInfo.resolution -> (mapX, mapY)
   * (mapX, mapY) + (originX, originY) -> (worldX, worldY)
   */
  const viewImage = useMemo(() => {
    if (!mapInfo || !mapData || !viewRect) return null
    mapLog.info('start rendering map')
    const pixels = new Uint8Array(CANVAS_WIDTH * CANVAS_HEIGHT * 4) // 初始化像素数组
    const scale = userTransform.resolution / mapInfo.resolution

    // 填充 pixels 数组
    for (let row = 0; row < CANVAS_HEIGHT; row++) {
      for (let col = 0; col < CANVAS_WIDTH; col++) {
        // targetCol 和 targetRow 转换到了原始map的resolution下的坐标
        const targetCol = Math.ceil(
          (col + viewRect.startX) * scale + mapInfo.origin.position.x,
        )
        const targetRow = Math.ceil(
          (row + viewRect.startY) * scale + mapInfo.origin.position.y,
        )

        // 如果超出边界，则填充为灰色
        if (
          targetCol < 0 ||
          targetRow < 0 ||
          targetCol >= mapInfo?.width ||
          targetRow >= mapInfo?.height
        ) {
          const i = (col + row * CANVAS_WIDTH) * 4
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
        const i = (col + row * CANVAS_WIDTH) * 4
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
        width: CANVAS_WIDTH,
        height: CANVAS_HEIGHT,
        alphaType: AlphaType.Opaque,
        colorType: ColorType.RGBA_8888,
      },
      data,
      CANVAS_WIDTH * 4,
    )
    return img
  }, [viewRect, mapInfo.resolution, userTransform.resolution])

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
   * @param centerPosition 处于map坐标系下增加了userTransform变换的中心点坐标
   */
  const updateViewRect = (centerPosition: { x: number; y: number }) => {
    const { mapInfo } = store.getState().draw
    if (!mapInfo) return

    const startX = centerPosition.x - CANVAS_WIDTH / 2
    const startY = centerPosition.y - CANVAS_HEIGHT / 2
    const endX = startX + CANVAS_WIDTH
    const endY = startY + CANVAS_HEIGHT

    // 仅在位置发生变化时更新状态
    if (startX !== viewRect?.startX || startY !== viewRect.startY) {
      setViewRect({ startX, startY, endX, endY })
    }
  }

  /**
   * 拖拽触发更新视图中心
   * 初始中心为地图中心
   * newOrigin: 处于map坐标系下增加了userTransform变换的中心点坐标
   */
  useEffect(() => {
    const scale = mapInfo.resolution / userTransform.resolution
    const newOrigin = {
      x:
        (mapInfo.width / 2 - mapInfo.origin.position.x) * scale +
        userTransform.x,
      y:
        (mapInfo.height / 2 - mapInfo.origin.position.y) * scale +
        userTransform.y,
    }
    updateViewRect(newOrigin)
    updateCenterPoint(newOrigin)
  }, [mapInfo, userTransform])

  return {
    viewRect,
    viewImage,
    fetchImageData,
  }
}
