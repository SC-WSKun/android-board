import { useDrawContext } from '@/store/draw.slice'
import { callService } from '@/store/foxglove.trunk'
import { AppDispatch } from '@/store/store'
import { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useDispatch } from 'react-redux'

interface IMapSelectView {}
export function MapSelectView(props: IMapSelectView) {
  const dispatch = useDispatch<AppDispatch>()
  const [mapList, setMapList] = useState([])
  const { changeMap, setCurrentView } = useDrawContext()

  const handleSelectMap = (map: RobotMap) => {
    changeMap(map)
    setCurrentView('navigation')
  }

  // 渲染地图卡片
  const renderItem = (map: RobotMap) => (
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

  // 获取地图列表
  useEffect(() => {
    dispatch(callService('/tiered_nav_conn_graph/list_maps', {}))
      .then((res: any) => {
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
