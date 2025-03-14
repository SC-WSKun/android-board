import React from 'react'
import ImageContainer from '@/components/ui/ImageContainer'
import { useMemo } from 'react'
import { LabelView } from '@/components/LabelView'
import { MapSelectView } from '@/components/MapSelectView'
import { RobotMap } from '@/components/RobotMap'
import { useDrawContext } from '@/store/draw.slice'

function NavigationScreen() {
  const { currentView, setCurrentView } = useDrawContext()

  const renderView = useMemo(() => {
    switch (currentView) {
      case 'label':
        return <LabelView />
      case 'select-map':
        return (
          <MapSelectView
            nextView={() => {
              setCurrentView('navigation')
            }}
          />
        )
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
