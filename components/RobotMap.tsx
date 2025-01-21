import { useDrawContext } from '@/store/drawContext'
import { useGlobal } from '@/store/globalContext'
import { useEffect } from 'react'
import { View, Text } from 'react-native'

type MapInfo = {
  width: number
  height: number
  resolution: number
  origin: {
    position: {
      x: number
      y: number
      z: number
    }
    orientation: Quaternion
  }
  map_load_time: {
    nsec: number
    sec: number
  }
}

type GridMap = {
  data: Uint8Array
  header: {
    frame_id: string
    stamp: {
      nesc: number
      sec: number
    }
  }
  info: MapInfo
}

export function RobotMap() {
  const { callService } = useGlobal()
  const { drawingMap } = useDrawContext()

  useEffect(() => {
    callService('/tiered_nav_state_machine/get_grid_map', {
      info: drawingMap,
    })
      .then(res => {
        console.log('res:', res)
        // state.drawManage.unSubscribeCarPosition()
        // state.drawManage.unSubscribeScanPoints()
        // unSubscribeMapTopic()
        // const wrap = document.getElementById('navigationMap') as HTMLElement
        // state.drawManage.drawGridMap(wrap, res.map, true)
        // state.curState = STATE_MAP.PREVIEWING
        // globalStore.setLoading(false)
        // initPose()
        // globalStore.closeModal()
        // state.mapName = record.map_name
      })
      .catch(err => {
        console.log(err)
      })
  }, [drawingMap])
  return (
    <View>
      <Text>RobotMap</Text>
    </View>
  )
}
