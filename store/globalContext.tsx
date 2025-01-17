import { useFoxgloveClient } from '@/hooks/useFoxgloveClient'
import { ClientChannelWithoutId, FoxgloveClient } from '@foxglove/ws-protocol'
import React, { createContext, useState, useContext, ReactNode } from 'react'

interface GlobalContextType {
  // Foxglove
  initClient: (wsUrl: string) => Promise<any>
  closeClient: () => void
  foxgloveClientConnected: () => boolean
  subscribeTopic: (topic: string) => void
  unSubscribeTopic: (subId: number) => void
  listenMessage: (callback: (...args: any) => void) => void
  stopListenMessage: (callback: (...args: any) => void) => void
  publishMessage: (channelId: number, message: any) => void
  callService: (
    srvName: string,
    payload?: { [key: string]: any },
  ) => Promise<any>
  advertiseTopic: (channel: ClientChannelWithoutId) => void
  unAdvertiseTopic: (channelId: number) => void
  readMsgWithSubId: (subId: number, data: DataView) => any

  // HTTP中间件
  middlewareUrl: string
  setMiddlewareUrl: (url: string) => void
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined)

interface GlobalProviderProps {
  children: ReactNode
}

/**
 * 这里用全局context来实现单例FoxgloveClient
 */
export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const {
    initClient,
    closeClient,
    foxgloveClientConnected,
    subscribeTopic,
    unSubscribeTopic,
    listenMessage,
    stopListenMessage,
    publishMessage,
    callService,
    advertiseTopic,
    unAdvertiseTopic,
    readMsgWithSubId,
  } = useFoxgloveClient()
  const [middlewareUrl, setMiddlewareUrl] = useState<string>('')

  return (
    <GlobalContext.Provider
      value={{
        initClient,
        closeClient,
        foxgloveClientConnected,
        subscribeTopic,
        unSubscribeTopic,
        listenMessage,
        stopListenMessage,
        publishMessage,
        callService,
        advertiseTopic,
        unAdvertiseTopic,
        readMsgWithSubId,
        middlewareUrl,
        setMiddlewareUrl,
      }}
    >
      {children}
    </GlobalContext.Provider>
  )
}

// 自定义 Hook 访问全局变量
export const useGlobal = (): GlobalContextType => {
  const context = useContext(GlobalContext)
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider')
  }
  return context
}
