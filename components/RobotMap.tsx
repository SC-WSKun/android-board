import { useDrawContext } from '@/store/drawContext'
import { useGlobal } from '@/store/globalContext'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Canvas, Circle, Group } from '@shopify/react-native-skia'

interface IRobotMapProps {
  fn: any
}

export function RobotMap(props: IRobotMapProps) {
  const { callService } = useGlobal()
  const { drawingMap } = useDrawContext()
  const [mapInfo, setMapInfo] = useState<any>(undefined)
  const [mapData, setMapData] = useState<any>(undefined)
  const width = 256
  const height = 256
  const r = width * 0.33

  // TODO: 重置地图监听
  const clearListener = () => {
    console.log('clearListener')
  }

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

  return (
    <View>
      <Canvas style={{ width, height }}>
        <Group blendMode='multiply'>
          <Circle cx={r} cy={r} r={r} color='cyan' />
          <Circle cx={width - r} cy={r} r={r} color='magenta' />
          <Circle cx={width / 2} cy={width - r} r={r} color='yellow' />
        </Group>
      </Canvas>
    </View>
  )
}
