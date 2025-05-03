import { otherLog } from '@/log/logger'
import { Audio } from 'expo-av'
import { AUDIO_FILE_PATH } from './TtsSocketProxy'

const TEST_AUDIO_FILE_SOURCE　= require('../assets/sample-3s.mp3')

class TtsPlayer {
  static async playSound(path: string) {
    otherLog.info('Loading Sound')
    try {
      // const { sound } = await Audio.Sound.createAsync({ uri: path })
      const { sound } = await Audio.Sound.createAsync(TEST_AUDIO_FILE_SOURCE)
      await sound.playAsync()
      sound.unloadAsync()
    } catch (err) {
      otherLog.error('Play Sound Error')
    }
  }
}

export default TtsPlayer
