import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { Canvas, Image } from '@shopify/react-native-skia'
import { transformPointCloud } from '@/utils/laserPoint'
import LaserPointAtlas from './LaserPointAtlas'
import { applyTransform } from '@/utils/coodinate'
import { useDrawContext } from '@/store/drawSlice'
import { useDispatch } from 'react-redux'
import store, { AppDispatch } from '@/store/store'
import {
  callService,
  listenMessage,
  readMsgWithSubId,
  subscribeTopic,
  unSubscribeTopic,
} from '@/store/foxgloveTrunk'
import { useTransformContext } from '@/store/transformSlice'
import _ from 'lodash'
import { MessageData } from '@foxglove/ws-protocol'
import { useCar } from '@/hooks/useCar'

interface IRobotMapProps {
  plugins: string[]
}

export function RobotMap(props: IRobotMapProps) {
  const { plugins } = props
  const width = 1000 // canvas宽度
  const height = 600 // canvas高度
  const dispatch = useDispatch<AppDispatch>()
  const {
    drawingMap,
    mapImage,
    updateLaserPoints,
    updateMapImage,
    updateMapInfo,
  } = useDrawContext()
  const { subscribeCarPosition } = useCar()
  const { updateTransform } = useTransformContext()
  const [displayLaser, setDisplayLaser] = useState<any[]>([])

  const updateTransforms = (
    transforms: {
      transform: Transform
      child_frame_id: string
      [key: string]: any
    }[],
  ) => {
    transforms?.forEach(transform => {
      updateTransform(transform.child_frame_id, transform.transform)
    })
  }

  /**
   * 渲染地图，赋值给image
   */
  const renderMapImage = (mapInfo: any, mapData: any) => {
    const base64String = btoa(String.fromCharCode(...mapData))
    updateMapImage(
      width,
      height,
      mapInfo.width,
      mapInfo.height,
      mapInfo.resolution,
      base64String,
    )
  }

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
    if (transformedPoints) {
      updateLaserPoints(transformedPoints)
    }
  }

  /**
   * 点云坐标系映射到map(世界坐标)
   * laser_link -> base_link -> base_foot_print -> odom -> map
   */
  const getPositionWithFrame = (
    frame_id: string,
    points: { x: number; y: number }[],
  ): { x: number; y: number }[] | null => {
    if (!frame_id) return null
    return points.map(position => {
      // 这里在ws的回调中调用的，非react组件不能直接获得react的状态，所以要用store.getState
      const state = store.getState()
      const laserLinkToBaseLink = state.transform.laserLinkToBaseLink
      const baseLinkToBaseFootprint = state.transform.baseLinkToBaseFootprint
      const baseFootprintToOdom = state.transform.baseFootprintToOdom
      const odomToMap = state.transform.odomToMap
      let tmp: any = position
      tmp = applyTransform(position, laserLinkToBaseLink)
      tmp = applyTransform(tmp, baseLinkToBaseFootprint)
      tmp = applyTransform(tmp, baseFootprintToOdom)
      tmp = applyTransform(tmp, odomToMap)
      return tmp
    })
  }

  /**
   * 处理tf_static的信息
   */
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
      console.log('fetching data')
      try {
        const res: any = await dispatch(
          callService('/tiered_nav_state_machine/get_grid_map', {
            info: drawingMap,
          }),
        )
        if (res?.map?.info) {
          updateMapInfo(res.map.info)
          renderMapImage(res.map.info, res.map.data)
          subscribeTopics()
        } else {
          throw new Error('Map data is undefined')
        }
      } catch (error) {
        console.error('Error fetching map data:', error)
        console.error('fetching map is:', drawingMap)
      }
    }
    fetchData()
  }, [drawingMap])

  /**
   * 订阅必须topic
   * tf: 更新baseFootprintToOdom,leftWheelToBaseLink,rightWheelToBaseLink,odomToMap(导航模式下)
   * tf_static: 更新laserLinkToBaseLink, baseLinkToBaseFootprint
   */
  const subscribeTopics = () => {
    dispatch(
      callService('/tiered_nav_state_machine/switch_mode', {
        mode: 2,
      }),
    )
    subscribeCarPosition()
    dispatch(subscribeTopic('/tf_static'))
      .then((res: any) => {
        dispatch(listenMessage('/tf_static', tfStaticHandler))
      })
      .catch((err: any) => {
        console.error('[RobotMap] subscribe topic tf_static error:', err)
      })
    // dispatch(subscribeTopic('/scan'))
    //   .then((res: any) => {
    //     dispatch(listenMessage('/scan', laserPointHandler))
    //   })
    //   .catch((err: any) => {
    //     console.error('[RobotMap] subscribe topic scan error:', err)
    //   })
    // return () => {
    //  dispatch(unSubscribeTopic('/scan'))
    // }
  }

  // useEffect(() => {
  //   function updateLaserPoint() {
  //     setTimeout(() => {
  //       const state = store.getState()
  //       const mapHasInit = state.draw.mapHasInit
  //       if (mapHasInit) {
  //         const laserPoints = state.draw.laserPoints
  //         setDisplayLaser(laserPoints)
  //       }
  //       updateLaserPoint()
  //     }, 250)
  //   }
  //   updateLaserPoint()
  // }, [])

  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Canvas style={{ width, height }}>
        <Image
          image={mapImage}
          fit='contain'
          x={0}
          y={0}
          width={1000}
          height={600}
        />
        {/* <LaserPointAtlas laserPoints={displayLaser} /> */}
      </Canvas>
    </View>
  )
}
