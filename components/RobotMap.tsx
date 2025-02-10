import { useDrawContext } from '@/store/drawContext'
import { useGlobal } from '@/store/globalContext'
import { useEffect, useState } from 'react'
import { View } from 'react-native'
import {
  Canvas,
  Circle,
  Group,
  Skia,
  AlphaType,
  ColorType,
  Image,
} from '@shopify/react-native-skia'

interface IRobotMapProps {
  fn: any
}

export function RobotMap(props: IRobotMapProps) {
  const { callService } = useGlobal()
  const { drawingMap } = useDrawContext()
  const [mapInfo, setMapInfo] = useState<any>(undefined)
  const [mapData, setMapData] = useState<any>(undefined)
  const width = 1000
  const height = 600
  const r = width * 0.33

  const pixels = new Uint8Array(1000 * 600 * 4)
  pixels.fill(255)
  let i = 0
  for (let x = 0; x < 1000; x++) {
    for (let y = 0; y < 600; y++) {
      pixels[i] = (x * y) % 255
      i += 4
    }
  }
  const data = Skia.Data.fromBytes(pixels)
  const img = Skia.Image.MakeImage(
    {
      width: 1000,
      height: 600,
      alphaType: AlphaType.Opaque,
      colorType: ColorType.RGBA_8888,
    },
    data,
    1000 * 4,
  )

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
    return
    fetchData()
  }, [drawingMap])

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas style={{ width, height }}>
        <Image
          image={img}
          fit='contain'
          x={0}
          y={0}
          width={1000}
          height={600}
        />
      </Canvas>
    </View>
  )
}
