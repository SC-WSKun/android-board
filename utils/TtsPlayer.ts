import { otherLog } from '@/log/logger'
import { Audio } from 'expo-av'

class TtsPlayer {
  private static sound: Audio.Sound | null = null

  static async playSound(path: string) {
    otherLog.info('Loading Sound')
    try {
      // Unload any existing sound first
      await this.unloadSound()
      // Create and store the new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: path },
        { shouldPlay: false },
        this._onPlaybackStatusUpdate,
      )
      this.sound = sound
      await sound.playAsync()
    } catch (err) {
      otherLog.error('Play Sound Error', err)
    }
  }

  static async unloadSound() {
    if (this.sound) {
      otherLog.info('Unloading Sound')
      try {
        await this.sound.unloadAsync()
        this.sound = null
      } catch (err) {
        otherLog.error('Unload Sound Error', err)
      }
    }
  }

  static _onPlaybackStatusUpdate = (status: any) => {
    if (status.didJustFinish) {
      // Sound has finished playing, unload it
      otherLog.info('Sound playback finished')
      this.unloadSound()
    }
  }
}

export default TtsPlayer
