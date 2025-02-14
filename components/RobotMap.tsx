import { useCallback, useEffect, useMemo, useState } from 'react'
import { View } from 'react-native'
import {
  Canvas,
  Skia,
  AlphaType,
  ColorType,
  Image,
} from '@shopify/react-native-skia'
import { transformPointCloud } from '@/utils/laserPoint'
import LaserPointAtlas from './LaserPointAtlas'
import { TRANSFORM_MAP } from '@/constants/TransformMap'
import { applyTransform } from '@/utils/coodinate'
import _ from 'lodash'
import { useDrawContext } from '@/store/drawSlice'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '@/store/store'
import {
  callService,
  listenMessage,
  readMsgWithSubId,
  subscribeTopic,
} from '@/store/foxgloveTrunk'
import { useTransformContext } from '@/store/transformSlice'

interface IRobotMapProps {
  plugins: string[]
}

export function RobotMap(props: IRobotMapProps) {
  const { plugins } = props
  const width = 1000 // canvas宽度
  const height = 600 // canvas高度
  const dispatch = useDispatch<AppDispatch>()
  const { drawingMap } = useDrawContext()
  const {
    odomToMap,
    baseFootprintToOdom,
    baseLinkToBaseFootprint,
    laserLinkToBaseLink,
    updateTransform,
  } = useTransformContext()
  // const { getTransform } = useTransformContext()
  const [mapInfo, setMapInfo] = useState<any>(undefined) // 地图的长宽等信息
  const [mapData, setMapData] = useState<any>(undefined) // 地图的点云信息
  const [bgImage, setBgImage] = useState<any>(undefined)

  const updateTransforms = (
    transforms: {
      transform: Transform
      child_frame_id: string
      [key: string]: any
    }[],
  ) => {
    transforms?.forEach(transform => {
      updateTransform(
        TRANSFORM_MAP[transform.child_frame_id],
        transform.transform,
      )
    })
  }

  /**
   * 渲染地图，赋值给image
   */
  const renderMapImage = useCallback(() => {
    const { width: mapWidth, height: mapHeight } = mapInfo
    const pixels = new Uint8Array(1000 * 600 * 4) // 初始化像素数组
    const widthScale = mapWidth / width
    const heightScale = mapHeight / height
    const mapScale = Math.max(widthScale, heightScale) // 计算缩放比例

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

    setBgImage(img)
  }, [mapData])

  /**
   * 激光点云回调
   */
  const laserPointHandler = async (
    op: any,
    subscriptionId: number,
    timestamp: number,
    data: any,
  ) => {
    const parseData: any = await dispatch(
      readMsgWithSubId(subscriptionId, data),
    )
    let laserFrame = parseData.header.frame_id
    let points = transformPointCloud(parseData)
    let transformedPoints = getPositionWithFrame(laserFrame, points)
  }

  /**
   * 点云坐标系映射到map(世界坐标)
   * laser_link -> base_link -> base_foot_print -> odom -> map
   */
  const getPositionWithFrame = (
    frame_id: string,
    points: { x: number; y: number }[],
  ) => {
    if (!frame_id) return null
    return points.map(position => {
      let tmp: any = position

      tmp = applyTransform(position, laserLinkToBaseLink)
      if (!tmp) return null
      tmp = applyTransform(tmp, baseLinkToBaseFootprint)
      tmp = applyTransform(tmp, baseFootprintToOdom)
      tmp = applyTransform(tmp, odomToMap)
      return tmp
    })
  }

  const tfStaticHandler = async (
    op: any,
    subscriptionId: number,
    timestamp: number,
    data: any,
  ) => {
    const parseData: any = await dispatch(
      readMsgWithSubId(subscriptionId, data),
    )
    updateTransforms(parseData.transforms)
  }

  /**
   * 获取地图数据
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res: any = await dispatch(
          callService('/tiered_nav_state_machine/get_grid_map', {
            info: drawingMap,
          }),
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
   * 地图点云信息变化时更新地图
   */
  useEffect(() => {
    if (mapData) {
      renderMapImage()
    }
  }, [mapData])

  /**
   * 订阅必须topic
   */
  useEffect(() => {
    dispatch(subscribeTopic('/tf_static'))
      .then((res: any) => {
        dispatch(listenMessage('/tf_static', tfStaticHandler))
      })
      .catch((err: any) => {
        console.error(err)
      })
    dispatch(subscribeTopic('/scan'))
      .then((res: any) => {
        dispatch(listenMessage('/scan', laserPointHandler))
      })
      .catch((err: any) => {
        console.error(err)
      })
  }, [])

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas style={{ width, height }}>
        <Image
          image={bgImage}
          fit='contain'
          x={0}
          y={0}
          width={1000}
          height={600}
        />
        <LaserPointAtlas />
      </Canvas>
    </View>
  )
}
