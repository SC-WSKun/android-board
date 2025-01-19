import { useGlobal } from '@/store/globalContext'
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'

export interface Map {
  map_name: string
  map_type: number
  nav_mode: number
}

export function MapSelectView() {
  const [mapList, setMapList] = useState([])
  const { callService } = useGlobal()
  // 获取屏幕宽度

  const handleSelectMap = (map: Map) => {
    callService('/tiered_nav_state_machine/get_grid_map', {
      info: map,
    })
    // .then(res => {
    //   state.drawManage.unSubscribeCarPosition()
    //   state.drawManage.unSubscribeScanPoints()
    //   unSubscribeMapTopic()
    //   const wrap = document.getElementById('navigationMap') as HTMLElement
    //   state.drawManage.drawGridMap(wrap, res.map, true)
    //   state.curState = STATE_MAP.PREVIEWING
    //   globalStore.setLoading(false)
    //   initPose()
    //   globalStore.closeModal()
    //   state.mapName = record.map_name
    // })
    // .catch(err => {
    //   console.log(err)
    //   globalStore.setLoading(false)
    // })
  }

  // 渲染地图卡片
  const renderItem = (map: Map) => (
    <TouchableOpacity
      key={map.map_name}
      style={[styles.card]}
      onPress={() => {
        handleSelectMap(map)
      }}
    >
      <Icon
        name='map-marker'
        size={30}
        color='#007bff'
        style={styles.cardIcon}
      />
      <Text style={styles.cardTitle}>{map.map_name}</Text>
    </TouchableOpacity>
  )

  useEffect(() => {
    // 获取地图列表
    callService('/tiered_nav_conn_graph/list_maps', {})
      .then(res => {
        console.log(res.maps.length)
        setMapList(res.maps)
      })
      .catch(err => {
        alert('获取地图列表失败，请稍后再试')
      })
  }, [])

  return (
    <View style={styles.navigationView}>
      <Text style={styles.title}>请选择机器人加载的地图：</Text>
      <View style={styles.gridContainer}>
        {mapList.map(item => renderItem(item))}
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  navigationView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    gap: '5%',
    padding: 48,
  },
  card: {
    width: '30%',
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 30,
    marginBottom: 30,
    elevation: 3, // 添加阴影效果
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 5,
    marginRight: 15,
    backgroundColor: '#e0e0e0', // 图标的背景颜色
  },
  cardText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
})
