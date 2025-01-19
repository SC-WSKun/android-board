import ImageContainer from '@/components/ui/ImageContainer'
import { useGlobal } from '@/store/globalContext'
import { router } from 'expo-router'
import { useEffect, useState } from 'react'
import { NAVIGATION_MAP } from './_layout'
import { LabelView } from '@/components/LabelView'
import { MapSelectView } from '@/components/MapSelectView'

type NavigationView = 'label' | 'select-map' | 'navigation'

export default function NavigationScreen() {
  const { foxgloveClientConnected } = useGlobal()
  const [currentView, setCurrentView] = useState<NavigationView>('select-map')

  const renderView = () => {
    switch (currentView) {
      case 'label':
        return <LabelView />
      case 'select-map':
        return <MapSelectView />
      case 'navigation':
        return <></>
      default:
        return <></>
    }
  }

  // 如果 foxgloveClient 未初始化，则跳转到设置页面
  useEffect(() => {
    if (!foxgloveClientConnected()) {
      router.push(NAVIGATION_MAP.SETTING)
    }
  }, [foxgloveClientConnected])

  return <ImageContainer>{renderView()}</ImageContainer>
}
