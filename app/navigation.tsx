import React from 'react'
import ImageContainer from '@/components/ui/ImageContainer'
import { useGlobal } from '@/store/globalContext'
import { useMemo } from 'react'
import { LabelView } from '@/components/LabelView'
import { MapSelectView } from '@/components/MapSelectView'
import { RobotMap } from '@/components/RobotMap'
import { useDrawContext } from '@/store/drawSlice'

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
        return <RobotMap plugins={['laser-point']} />
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

export default NavigationScreen
