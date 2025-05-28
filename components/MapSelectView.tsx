import { useDrawContext } from '@/store/draw.slice'
import { callService } from '@/store/foxglove.trunk'
import { AppDispatch } from '@/store/store'
import { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { useDispatch } from 'react-redux'

interface IMapSelectView {
  onSelectMap: () => void
}
export function MapSelectView(props: IMapSelectView) {
  const { onSelectMap } = props
  const dispatch = useDispatch<AppDispatch>()
  const [mapList, setMapList] = useState<RobotMap[]>([])
  const { changeMap } = useDrawContext()

  const handleSelectMap = (map: RobotMap) => {
    changeMap(map)
    onSelectMap()
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
      <Text style={styles.cardTitle} numberOfLines={1}>
        {map.map_name}
      </Text>
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
      <ScrollView>
        <View style={styles.gridContainer}>
          {mapList.map(item => renderItem(item))}
        </View>
      </ScrollView>
    </View>
  )
}
const styles = StyleSheet.create({
  navigationView: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    gap: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    gap: 20,
  },
  card: {
    width: 220,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 30,
    marginBottom: 20,
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
    width: '55%',
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
})
