import { AppDispatch, RootState } from './store'
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
import {
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
} from './foxglove.slice'
import { rosLog } from '@/log/logger'

let client: FoxgloveClient | null = null

/**
 * init foxglove client & storage channels and services
 */
export const initClient =
  (wsUrl: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    return new Promise((resolve, reject) => {
      const socket = new WebSocket(`ws://${wsUrl}:8765`, [
        FoxgloveClient.SUPPORTED_SUBPROTOCOL,
      ])
      const clientInstance = new FoxgloveClient({
        ws: socket,
      })

      clientInstance.on('advertise', (rx_channels: Channel[]) => {
        const channels = { ...getState().foxglove.channels }
        for (const channel of rx_channels) {
          channels[channel.id] = channel
        }
        dispatch(setChannels(channels))
      })

      clientInstance.on('unadvertise', (channelIds: number[]) => {
        const channels = { ...getState().foxglove.channels }
        channelIds.forEach((id: number) => {
          delete channels[id]
        })
        dispatch(setChannels(channels))
      })

      clientInstance.on('advertiseServices', (rx_services: Service[]) => {
        const services = [...getState().foxglove.services, ...rx_services]
        dispatch(setServices(services))
      })

      clientInstance.on('open', () => {
        client = clientInstance
        dispatch(setConnected(true))
        resolve('foxgloveClient initialized')
      })

      clientInstance.on('error', e => {
        rosLog.error('foxgloveClient error:', e)
        reject('foxgloveClient init error')
      })

      clientInstance.on('close', e => {
        dispatch(setClient(null))
        dispatch(setConnected(false))
      })

      clientInstance.on('serverInfo', (serverInfo: any) => {
        if (serverInfo.supportedEncodings) {
          dispatch(setMsgEncoding(serverInfo.supportedEncodings[0]))
        }
      })
    })
  }

export const closeClient =
  () => async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!client) {
      return Promise.reject('Client has been closed')
    }
    // Unadvertise all channels
    getState().foxglove.advertisedChannels.forEach((channel: any) => {
      if (client) {
        client.unadvertise(channel.id)
      }
    })
    // Unsubscribe all topics
    Object.values(getState().foxglove.subs).forEach(sub => {
      if (client) {
        client.unsubscribe(sub.subId)
      }
    })
    client.close()
    client = null
    dispatch(setConnected(false))
  }

/**
 * subscribe one of the channels
 * @param topic topic's name
 * @returns id of the subscription
 */
export const subscribeTopic =
  (topic: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!client) {
      return Promise.reject('Client not initialized')
    }
    const subs = getState().foxglove.subs
    if (subs[topic]) {
      return Promise.reject('Subscription already exists')
    }
    const channels = getState().foxglove.channels
    const channel = _.find(Array.from(Object.values(channels)), { topic })
    if (!channel) {
      return Promise.reject('Channel not found')
    }
    const subId = client.subscribe(channel.id)
    dispatch(addSub({ topic, subId, channelId: channel.id }))
    return Promise.resolve(subId)
  }

/**
 * unsubscribe topic
 * @param topic name of the subscription
 * @returns
 */
export const unSubscribeTopic =
  (topic: string) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!client) {
      rosLog.error('Client not initialized!')
      return
    }
    const subs = getState().foxglove.subs
    client.unsubscribe(subs[topic].subId)
    dispatch(removeSub(topic))
  }

/**
 * publish message with one of the channel advertised
 * @param channelId id of channels advertised
 * @param message message to publish
 * @returns
 */
export const publishMessage =
  (topic: string, message: any) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const advertisedChannels = getState().foxglove.advertisedChannels
    if (!client) {
      rosLog.error('Client not initialized!')
      return
    }
    const channel = _.find(advertisedChannels, { topic })
    if (!channel) {
      rosLog.error('Channel not found!')
      return
    }
    const parseDefinitions = parseMessageDefinition(channel.schema, {
      ros2: true,
    })
    const writer = new MessageWriter(parseDefinitions)
    const uint8Array = writer.writeMessage(message)
    client.sendMessage(channel.id, uint8Array)
  }

/**
 * call service
 * @param srvName service name
 * @param payload request params
 * @returns a promise wait for the response
 */
export const callService =
  (srvName: string, payload?: { [key: string]: any }) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!client) {
      rosLog.error('Client not initialized!')
      return Promise.reject('Client not initialized!')
    }
    const services = getState().foxglove.services
    const srv: Service | undefined = _.find(services, { name: srvName })
    if (!srv) {
      rosLog.error('Service not found!')
      return Promise.reject('Service not found!')
    }
    const parseReqDefinitions = parseMessageDefinition(srv?.requestSchema!, {
      ros2: true,
    })
    const writer = new MessageWriter(parseReqDefinitions)
    const uint8Array = writer.writeMessage(payload)
    client.sendServiceCallRequest({
      serviceId: srv?.id!,
      callId: getState().foxglove.callServiceId + 1,
      encoding: getState().foxglove.msgEncoding,
      data: new DataView(uint8Array.buffer),
    })
    dispatch(incrementCallServiceId())
    return new Promise((resolve, reject) => {
      // 将监听回调函数抽离的目的是避免监听未及时off造成的内存泄漏
      function serviceResponseHandler(response: any) {
        const parseResDefinitions = parseMessageDefinition(
          srv?.responseSchema!,
          {
            ros2: true,
          },
        )
        try {
          const reader = new MessageReader(parseResDefinitions)
          if (response.data) {
            const res = reader.readMessage(response.data)
            resolve(res)
          } else {
            rosLog.info('response data is null')
          }
        } catch (err: any) {
          reject(err)
        } finally {
          client?.off('serviceCallResponse', serviceResponseHandler)
        }
      }
      client!.on('serviceCallResponse', serviceResponseHandler)
    })
  }

/**
 * advertise topic
 * @param channel channel to be advertised
 * @returns id of the channel
 */
export const advertiseTopic =
  (channel: ClientChannelWithoutId) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!client) {
      rosLog.error('Client not initialized!')
      return
    }
    const advertisedChannels = getState().foxglove.advertisedChannels
    if (advertisedChannels.find(item => item.topic === channel.topic)) {
      rosLog.warn('Channel already advertised!')
      return
    }
    const channelId = client.advertise(channel)
    dispatch(
      addAdvertisedChannel({
        id: channelId,
        ...channel,
      }),
    )
    return channelId
  }

/**
 * unadvertise topic
 * @param channelId id of the channel to be unadvertised
 * @returns
 */
export const unAdvertiseTopic =
  (channelId: number) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!client) {
      rosLog.error('Client not initialized!')
      return
    }
    // remove from advertised channels list
    dispatch(removeAdvertisedChannel(channelId))
    client.unadvertise(channelId)
  }

/**
 * receive the message from subscribeb channel by topic name
 * @param topic name of subcribed channel
 * @param callback
 * @returns
 */
export const listenMessageByTopic =
  (topic: string, callback: (...args: any) => void) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const subs = getState().foxglove.subs
    if (!client) {
      rosLog.error('Client not initialized!')
      return
    }
    const msgHandler = ({
      op,
      subscriptionId,
      timestamp,
      data,
    }: MessageData) => {
      if (!subs[topic]) {
        client?.off('message', msgHandler)
        return
      }
      if (subscriptionId === subs[topic].subId) {
        callback(op, subscriptionId, timestamp, data)
      }
    }
    client.on('message', msgHandler)
  }

/**
 * receive the message from subscribeb channel
 * @param callback
 * @returns
 */
export const listenMessage = (callback: (...args: any) => void) => {
  if (!client) {
    rosLog.error('Client not initialized!')
    return
  }
  const msgHandler = ({ op, subscriptionId, timestamp, data }: MessageData) => {
    callback({ op, subscriptionId, timestamp, data })
  }
  client.on('message', msgHandler)
}

/**
 * stop listen message of callback
 * @param callback
 * @returns
 */
export const stopListenMessage =
  (callback: (...args: any) => void) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    if (!client) {
      rosLog.error('Client not initialized!')
      return
    }
    client.off('message', callback)
  }

/**
 * format raw data
 * @param subId subId of topic
 * @param data raw data
 * @returns format data
 */
export const readMsgWithSubId =
  (subId: number, data: DataView) =>
  async (dispatch: AppDispatch, getState: () => RootState) => {
    const subs = getState().foxglove.subs
    const channels = getState().foxglove.channels
    const sub = _.find(subs, { subId })
    if (sub) {
      const channel = channels[sub.channelId]
      const parseDefinitions = parseMessageDefinition(channel?.schema!, {
        ros2: true,
      })
      const reader = new MessageReader(parseDefinitions)
      return reader.readMessage(data)
    } else {
      rosLog.error(`sub not found: ${subId}`)
    }
  }
