import { useDrawContext } from '@/store/drawContext'
import { useGlobal } from '@/store/globalContext'
import { useEffect, useRef, useState } from 'react'
import { View, Text } from 'react-native'
import Canvas from 'react-native-canvas'

interface IRobotMapProps {
  fn: any
}

export function RobotMap(props: IRobotMapProps) {
  const canvas = useRef<Canvas | null>(null)
  const { callService } = useGlobal()
  const { drawingMap } = useDrawContext()
  const [canvasSize] = useState({ width: 1000, height: 600 })
  const [resizing, setResizing] = useState(true)

  // TODO: 重置地图监听
  const clearListener = () => {
    console.log('clearListener')
  }

  // 渲染canvas
  const renderCanvas = async (type: string) => {
    if (!canvas.current) return
    const ctx = await canvas.current.getContext('2d')
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height) // Clear the canvas before drawing
    ctx.fillStyle = 'purple'
    ctx.fillRect(0, 0, 100, 100)

    ctx.fillStyle = 'red'
    ctx.fillRect(500, 500, 100, 100)
  }

  // 这个canvas变换大小的时候会导致渲染丢失，也没找到对应的回调监听，先搞个500ms延迟用着
  const waitingResizeCanvas = () => {
    setResizing(true)
    setTimeout(() => {
      setResizing(false)
    }, 500)
  }

  useEffect(() => {
    waitingResizeCanvas()
  }, [canvasSize])

  useEffect(() => {
    if (resizing) return
    callService('/tiered_nav_state_machine/get_grid_map', {
      info: drawingMap,
    })
      .then(res => {
        // console.log('res:', res.map)
        clearListener()
        renderCanvas('navigation')
        // unSubscribeMapTopic()
        // const wrap = document.getElementById('navigationMap') as HTMLElement
        // state.drawManage.drawGridMap(wrap, res.map, true)
        // state.curState = STATE_MAP.PREVIEWING
        // initPose()
        // globalStore.closeModal()
        // state.mapName = record.map_name
      })
      .catch(err => {
        console.log(err)
      })
  }, [resizing, drawingMap])
  return (
    <View>
      <Canvas
        ref={(canvasRef: Canvas) => {
          if (!canvasRef) return
          canvasRef.width = canvasSize.width
          canvasRef.height = canvasSize.height
          canvas.current = canvasRef
        }}
      />
    </View>
  )
}
