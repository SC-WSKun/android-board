import { configureStore } from '@reduxjs/toolkit'
import drawReducer from './drawSlice'
import foxgloveReducer from './foxgloveSlice'
import transformReducer from './transformSlice'

const store = configureStore({
  reducer: {
    draw: drawReducer,
    foxglove: foxgloveReducer,
    transform: transformReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
