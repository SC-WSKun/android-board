import ImageContainer from '@/components/ui/ImageContainer'
import { useGlobal } from '@/store/globalContext'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native'
import { NAVIGATION_MAP } from './_layout'
import { PositionLabel, useLabels } from '@/hooks/useLabels'
import Icon from 'react-native-vector-icons/FontAwesome'

export default function NavigationScreen() {
  const [labelList, setLabelList] = useState([])
  const { foxgloveClientConnected } = useGlobal()
  const { getLabels, navigateToLabel } = useLabels()

  // 获取屏幕宽度
  const { height } = useWindowDimensions()
  const cardWidth = height / 3 // 每行显示 3 个卡片，计算卡片宽度

  // 处理点击导航事件
  const handleNavigation = (label: PositionLabel) => {
    navigateToLabel(label)
      .then(res => {
        console.log('navigateToLabel res:', res)
      })
      .catch(err => {
        console.error('navigateToLabel error:', err)
      })
  }

  // 渲染标签卡片
  const renderItem = (label: PositionLabel) => (
    <TouchableOpacity
      key={label.label_name}
      style={[styles.card, { width: cardWidth }]}
      onPress={() => {
        handleNavigation(label)
      }}
    >
      <Icon
        name='map-marker'
        size={30}
        color='#007bff'
        style={styles.cardIcon}
      />
      <Text style={styles.cardTitle}>{label.label_name}</Text>
    </TouchableOpacity>
  )

  useEffect(() => {
    if (!foxgloveClientConnected()) {
      router.push(NAVIGATION_MAP.SETTING)
    }
  }, [foxgloveClientConnected])

  useEffect(() => {
    getLabels().then(res => {
      const { result, labels } = res
      if (result === true) {
        console.log('labels:', labels)
        setLabelList(labels)
      } else {
        console.error('getLabels error, maybe not in navigation mode')
      }
    })
  }, [])
  return (
    <ImageContainer>
      <View style={styles.navigationView}>
        <Text style={styles.title}>请选择您要前往的目的地：</Text>
        <View style={styles.gridContainer}>
          {labelList.map(item => renderItem(item))}
        </View>
      </View>
    </ImageContainer>
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
    justifyContent: 'space-between',
    width: '100%',
    padding: 48,
  },
  card: {
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
