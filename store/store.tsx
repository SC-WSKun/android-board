import { configureStore } from '@reduxjs/toolkit'
import drawReducer from './drawSlice'

const store = configureStore({
  reducer: {
    draw: drawReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export default store
