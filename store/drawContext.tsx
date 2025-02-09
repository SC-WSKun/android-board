import { createContext, ReactNode, useContext, useState } from 'react'

type NavigationView = 'label' | 'select-map' | 'navigation'

type DrawContextType = {
  currentView: NavigationView
  drawingMap: RobotMap | undefined
  changeMap: (map: RobotMap) => void
  setCurrentView: (view: NavigationView) => void
}

interface DrawProviderProps {
  children: ReactNode
}

const DrawContext = createContext<DrawContextType | undefined>(undefined)

export function DrawContextProvider({ children }: DrawProviderProps) {
  const [currentView, setCurrentView] = useState<NavigationView>('select-map')
  const [drawingMap, setDrawingMap] = useState<RobotMap | undefined>(undefined)

  const changeMap = (map: RobotMap) => {
    setDrawingMap(map)
  }
  return (
    <DrawContext.Provider
      value={{
        currentView,
        drawingMap,
        changeMap,
        setCurrentView,
      }}
    >
      {children}
    </DrawContext.Provider>
  )
}

export function useDrawContext() {
  const context = useContext(DrawContext)
  if (context === undefined) {
    throw new Error('useDrawContext must be used within a DrawContextProvider')
  }
  return context
}
