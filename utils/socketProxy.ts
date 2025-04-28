import { otherLog } from '@/log/logger'
import { Socket, io } from 'socket.io-client'

const MIDDLE_WARE_URL = 'http://192.168.1.145:3001'

class SocketProxy {
  private static socket: Socket

  /**
   * 初始化websocket代理连接
   */
  static init() {
    otherLog.info('Huoshan TTS Service Init')
    const socket = io(`${MIDDLE_WARE_URL}/audio`, {
      transports: ['websocket'],
    })
    socket.on('audio-data', audioChunk => {
      // 这里拿到服务器转发的音频数据
      // 解码并播放
    })
    socket.on('disconnect', () => {
      console.log('Disconnected')
    })
    SocketProxy.socket = socket
  }

  /**
   * 传输待合成文本到语音合成服务
   * @param text 待合成文本
   */
  static sendTtsText(text: string){
    this.socket.emit('send-tts-data', text)
  }
}

export default SocketProxy
