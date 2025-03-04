import { configureStore } from '@reduxjs/toolkit'
import drawReducer from './draw.slice'
import foxgloveReducer from './foxglove.slice'
import transformReducer from './transform.slice'

const store = configureStore({
  reducer: {
    draw: drawReducer,
    foxglove: foxgloveReducer,
    transform: transformReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store
