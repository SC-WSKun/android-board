import { useDrawContext } from '@/store/drawContext'
import { useGlobal } from '@/store/globalContext'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, Text } from 'react-native'
import Canvas, {
  Image as CanvasImage,
  Path2D,
  ImageData,
} from 'react-native-canvas'

interface IRobotMapProps {
  fn: any
}

export function RobotMap(props: IRobotMapProps) {
  const canvas = useRef<Canvas | null>(null)
  const { callService } = useGlobal()
  const { drawingMap } = useDrawContext()
  const [mapInfo, setMapInfo] = useState<any>(undefined)
  const [mapData, setMapData] = useState<any>(undefined)
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 600 })
  const [resizing, setResizing] = useState(true)

  // TODO: 重置地图监听
  const clearListener = () => {
    console.log('clearListener')
  }

  // 渲染canvas
  const renderCanvas = async () => {
    if (!canvas.current) return
    console.log('[RobotMap] render canvas')
    const ctx = await canvas.current.getContext('2d')
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height) // Clear the canvas before drawing
    ctx
      .getImageData(0, 0, canvasSize.width, canvasSize.height)
      .then(imageData => {
        if (!canvas.current) return
        console.log('[RobotMap] render image data')
        console.log('imageData:', imageData)
        const data = Object.values(imageData.data)
        const length = Object.keys(data).length
        console.log(mapData)
        for (let row = 0; row < canvasSize.height; row++) {
          for (let col = 0; col < canvasSize.width; col++) {
            const mapI = col + (canvasSize.height - 1 - row) * canvasSize.width
            const val = mapData[mapI]
            const i = (col + row * canvasSize.width) * 4

            data[i] = val === 100 ? 0 : val === 0 ? 236 : 127
            data[i + 1] = val === 100 ? 0 : val === 0 ? 236 : 127
            data[i + 2] = val === 100 ? 0 : val === 0 ? 236 : 127
            data[i + 3] = 236
          }
        }
        console.log(data.length)
        console.log(canvasSize.width)
        console.log(canvasSize.height)
        const imgData = new ImageData(
          canvas.current,
          data,
          canvasSize.width,
          canvasSize.height,
        )
        ctx.putImageData(imgData, 0, 0)
      })
      .catch(err => {
        console.error('[RobotMap] render imageData error:', err)
      })
  }

  // 这个canvas变换大小的时候会导致渲染丢失，也没找到对应的回调监听，先搞个500ms延迟用着
  const waitingResizeCanvas = () => {
    setResizing(true)
    if (canvas.current) {
      canvas.current.width = canvasSize.width
      canvas.current.height = canvasSize.height
    }
    setTimeout(() => {
      setResizing(false)
    }, 500)
  }

  /**
   * canvas大小变换时等待初始化
   */
  useEffect(() => {
    waitingResizeCanvas()
  }, [canvasSize])

  /**
   * 获取地图数据
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await callService(
          '/tiered_nav_state_machine/get_grid_map',
          {
            info: drawingMap,
          },
        )
        if (res?.map?.info) {
          setMapInfo(res.map.info)
          setMapData(res.map.data)
        } else {
          setMapInfo(undefined)
        }
      } catch (error) {
        console.error('Error fetching map data:', error)
        setMapInfo(undefined)
      }
    }

    fetchData()
  }, [drawingMap])

  /**
   * 地图数据处理，更新地图大小、渲染地图
   */
  useEffect(() => {
    if (mapInfo) {
      if (
        mapInfo.width !== canvasSize.width ||
        mapInfo.height !== canvasSize.height
      ) {
        console.log('[RobotMap] resize canvas')
        setCanvasSize({ width: mapInfo.width, height: mapInfo.height })
      }
      renderCanvas()
    }
  }, [resizing, mapInfo])

  return (
    <View>
      <Canvas
        ref={(canvasRef: Canvas) => {
          canvas.current = canvasRef
        }}
      />
    </View>
  )
}
