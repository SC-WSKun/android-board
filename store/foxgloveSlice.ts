import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import {
  FoxgloveClient,
  Channel,
  ClientChannelWithoutId,
  Service,
  MessageData,
} from '@foxglove/ws-protocol'
import { MessageWriter, MessageReader } from '@foxglove/rosmsg2-serialization'
import { parse as parseMessageDefinition } from '@foxglove/rosmsg'
import _ from 'lodash'

interface FoxgloveState {
  client: FoxgloveClient | null
  channels: Record<number, Channel>
  services: Service[]
  subs: Record<string, { topic: string; subId: number; channelId: number }>
  advertisedChannels: any[]
  msgEncoding: string
  callServiceId: number
  isConnected: boolean
}

const initialState: FoxgloveState = {
  client: null,
  channels: {},
  services: [],
  subs: {},
  advertisedChannels: [],
  msgEncoding: 'cdr',
  callServiceId: 0,
  isConnected: false,
}

const foxgloveSlice = createSlice({
  name: 'foxglove',
  initialState,
  reducers: {
    setClient(state, action: PayloadAction<FoxgloveClient | null>) {
      state.client = action.payload
    },
    setChannels(state, action: PayloadAction<Record<number, Channel>>) {
      state.channels = action.payload
    },
    setServices(state, action: PayloadAction<Service[]>) {
      state.services = action.payload
    },
    addSub(
      state,
      action: PayloadAction<{
        topic: string
        subId: number
        channelId: number
      }>,
    ) {
      state.subs[action.payload.topic] = action.payload
    },
    removeSub(state, action: PayloadAction<string>) {
      delete state.subs[action.payload]
    },
    addAdvertisedChannel(state, action: PayloadAction<any>) {
      state.advertisedChannels.push(action.payload)
    },
    removeAdvertisedChannel(state, action: PayloadAction<number>) {
      state.advertisedChannels = state.advertisedChannels.filter(
        channel => channel.id !== action.payload,
      )
    },
    setMsgEncoding(state, action: PayloadAction<string>) {
      state.msgEncoding = action.payload
    },
    incrementCallServiceId(state) {
      state.callServiceId += 1
    },
    setConnected(state, action: PayloadAction<boolean>) {
      state.isConnected = action.payload
    },
  },
})

export const {
  setClient,
  setChannels,
  setServices,
  addSub,
  removeSub,
  addAdvertisedChannel,
  removeAdvertisedChannel,
  setMsgEncoding,
  incrementCallServiceId,
  setConnected,
} = foxgloveSlice.actions

export default foxgloveSlice.reducer
