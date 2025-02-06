import ImageContainer from '@/components/ui/ImageContainer'
import { useGlobal } from '@/store/globalContext'
import { router } from 'expo-router'
import { useEffect, useMemo } from 'react'
import { NAVIGATION_MAP } from './_layout'
import { LabelView } from '@/components/LabelView'
import { MapSelectView } from '@/components/MapSelectView'
import { RobotMap } from '@/components/RobotMap'
import { DrawContextProvider, useDrawContext } from '@/store/drawContext'

function NavigationScreen() {
  const { foxgloveClientConnected } = useGlobal()
  const { currentView } = useDrawContext()

  const renderView = useMemo(() => {
    switch (currentView) {
      case 'label':
        return <LabelView />
      case 'select-map':
        return <MapSelectView />
      case 'navigation':
        return (
          <RobotMap
            fn={() => {
              console.log('navigation map fn')
            }}
          />
        )
      default:
        return <></>
    }
  }, [currentView])

  // // 如果 foxgloveClient 未初始化，则跳转到设置页面
  // useEffect(() => {
  //   if (!foxgloveClientConnected()) {
  //     router.push(NAVIGATION_MAP.SETTING)
  //   }
  // }, [foxgloveClientConnected])

  return <ImageContainer>{renderView}</ImageContainer>
}

const NavigationScreenContainer = () => {
  return (
    <DrawContextProvider>
      <NavigationScreen />
    </DrawContextProvider>
  )
}

export default NavigationScreenContainer
