import { otherLog } from '@/log/logger'
import { Socket, io } from 'socket.io-client'
import * as FileSystem from 'expo-file-system'
import pako from 'pako'
import TtsPlayer from './TtsPlayer'

// 临时保存的文件路径
export const AUDIO_FILE_PATH =
  FileSystem.cacheDirectory + 'tts_stream_audio.mp3'

// 缓存所有音频payload片段
let cachedAudioBuffers: Uint8Array[] = []

// 是否已经完成
let audioDone = false
/**
 * 保存所有缓存的音频
 */
async function saveAudioToFile() {
  try {
    const fullAudio = Buffer.concat(cachedAudioBuffers)
    await FileSystem.writeAsStringAsync(
      AUDIO_FILE_PATH,
      fullAudio.toString('base64'),
      {
        encoding: FileSystem.EncodingType.Base64,
      },
    )
    otherLog.info('Audio saved to:', AUDIO_FILE_PATH)

    // 重置
    cachedAudioBuffers = []
    audioDone = false
  } catch (err) {
    otherLog.error('Save Audio Fail:', err)
  }
}

/**
 * 解析websocket传来的音频数据
 * @param res 音频二进制数据
 * @returns boolean 是否解析成功
 */
async function parseResponse(res: ArrayBuffer) {
  otherLog.info(
    '--------------------------- response ---------------------------',
  )

  const buffer = new Uint8Array(res)

  const protocolVersion = buffer[0] >> 4
  const headerSize = buffer[0] & 0x0f
  const messageType = buffer[1] >> 4
  const messageTypeSpecificFlags = buffer[1] & 0x0f
  const serializationMethod = buffer[2] >> 4
  const messageCompression = buffer[2] & 0x0f
  const reserved = buffer[3]
  const headerExtensions = buffer.slice(4, headerSize * 4)
  const payload = buffer.slice(headerSize * 4)

  otherLog.info(`            Protocol version: ${protocolVersion}`)
  otherLog.info(`                 Header size: ${headerSize * 4} bytes`)
  otherLog.info(`                Message type: ${messageType}`)
  otherLog.info(` Message type specific flags: ${messageTypeSpecificFlags}`)
  otherLog.info(`Message serialization method: ${serializationMethod}`)
  otherLog.info(`         Message compression: ${messageCompression}`)
  otherLog.info(`                    Reserved: ${reserved}`)

  if (headerSize !== 1) {
    otherLog.info(`           Header extensions:`, headerExtensions)
  }

  if (messageType === 0xb) {
    // audio-only server response
    if (messageTypeSpecificFlags === 0) {
      otherLog.info('                Payload size: 0')
      return false
    } else {
      const sequenceNumber = new DataView(payload.buffer).getInt32(0, false) // big-endian
      const payloadSize = new DataView(payload.buffer).getUint32(4, false) // big-endian
      const realPayload = payload.slice(8)

      otherLog.info(`             Sequence number: ${sequenceNumber}`)
      otherLog.info(`                Payload size: ${payloadSize} bytes`)

      cachedAudioBuffers.push(realPayload)

      // sequenceNumber < 0 代表流式语音传输结束
      // 保存音频到临时文件再进行播放
      if (sequenceNumber < 0) {
        audioDone = true
        await saveAudioToFile()
        await TtsPlayer.playSound(AUDIO_FILE_PATH)
        return true
      } else {
        return false
      }
    }
  } else if (messageType === 0xf) {
    // error
    const code = new DataView(payload.buffer).getUint32(0, false)
    const msgSize = new DataView(payload.buffer).getUint32(4, false)
    let errorMsg = payload.slice(8)

    if (messageCompression === 1) {
      errorMsg = pako.ungzip(errorMsg)
    }

    otherLog.error(`          Error message code: ${code}`)
    otherLog.error(`          Error message size: ${msgSize} bytes`)
    otherLog.error(
      `               Error message: ${new TextDecoder().decode(errorMsg)}`,
    )

    return true
  } else if (messageType === 0xc) {
    // frontend message
    const msgSize = new DataView(payload.buffer).getUint32(0, false)
    let frontendPayload = payload.slice(4)

    if (messageCompression === 1) {
      frontendPayload = pako.ungzip(frontendPayload)
    }

    otherLog.info(
      `            Frontend message: ${new TextDecoder().decode(frontendPayload)}`,
    )
    return false
  } else {
    otherLog.error('undefined message type!')
    return true
  }
}

class SocketProxy {
  private static socket: Socket

  /**
   * 初始化websocket代理连接
   */
  static init() {
    const url = `${process.env.EXPO_PUBLIC_MIDDLE_WARE_URL}/audio`
    otherLog.info('Huoshan TTS Service Init - Connecting to: ' + url)
    try {
      const socket = io(url, {
        transports: ['websocket'],
      })
      socket.on('connect', () => {
        otherLog.info('Huoshan TTS Service connected successfully')
      })
      // 拿到服务器转发的音频数据
      socket.on('audio-data', audioChunk => {
        // 解码并播放
        parseResponse(audioChunk)
      })
      socket.on('disconnect', () => {
        otherLog.info('Huoshan TTS Service Disconnected')
      })
      socket.on('error', err => {
        otherLog.error('Huoshan TTS Service error:', err)
      })
      SocketProxy.socket = socket
    } catch (err) {
      otherLog.error('Socket init error:', err)
    }
  }

  /**
   * 传输待合成文本到语音合成服务
   * @param text 待合成文本
   */
  static sendTtsText(text: string) {
    try {
      this.socket.emit('send-tts-data', text)
    } catch (err) {
      otherLog.error('send tts text error:', err)
    }
  }
}

export default SocketProxy
