import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from './store'

type NavigationView = 'label' | 'select-map' | 'navigation'

export interface DrawState {
  currentView: NavigationView
  drawingMap: RobotMap | undefined
}

const initialState: DrawState = {
  currentView: 'select-map',
  drawingMap: undefined,
}

const drawSlice = createSlice({
  name: 'draw',
  initialState,
  reducers: {
    setCurrentView(state, action: PayloadAction<NavigationView>) {
      state.currentView = action.payload
    },
    changeMap(state, action: PayloadAction<RobotMap>) {
      state.drawingMap = action.payload
    },
  },
})

export const { setCurrentView, changeMap } = drawSlice.actions
export default drawSlice.reducer

export function useDrawContext() {
  const dispatch = useDispatch()
  const currentView = useSelector((state: RootState) => state.draw.currentView)
  const drawingMap = useSelector((state: RootState) => state.draw.drawingMap)

  return {
    currentView,
    drawingMap,
    changeMap: (map: RobotMap) => dispatch(changeMap(map)),
    setCurrentView: (view: NavigationView) => dispatch(setCurrentView(view)),
  }
}
