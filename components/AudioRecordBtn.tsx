import { useState } from 'react'
import { View, StyleSheet, TouchableOpacity } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome'
import { Audio } from 'expo-av'

export function AudioRecordBtn({ size }: { size: number }) {
  const [recording, setRecording] = useState<any>()
  const [permissionResponse, requestPermission] = Audio.usePermissions()

  /**
   * 开始录制
   */
  async function startRecording() {
    try {
      if (permissionResponse?.status !== 'granted') {
        console.log('Requesting permission..')
        await requestPermission()
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      })

      console.log('Starting recording..')
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      )
      console.log('recording:', recording)
      setRecording(recording)
      console.log('Recording started')
    } catch (err) {
      console.error('Failed to start recording', err)
    }
  }

  /**
   * 停止录制
   */
  async function stopRecording() {
    console.log('Stopping recording..')
    setRecording(undefined)
    await recording.stopAndUnloadAsync()
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    })
    const uri = recording.getURI()
    console.log('Recording stopped and stored at', uri)
    // 测试音频
    // testAudioFile(uri)
  }

  /**
   * 测试录制音频文件用
   * @param path 文件路径
   */
  async function testAudioFile(path: string) {
    let tempSound: Audio.Sound | null = null
    function _onPlaybackStatusUpdate(status: any) {
      if (status.didJustFinish) {
        // Sound has finished playing, unload it
        tempSound?.unloadAsync()
        tempSound = null
      }
    }
    try {
      // Unload any existing sound first
      // Create and store the new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: path },
        { shouldPlay: false },
        _onPlaybackStatusUpdate,
      )
      tempSound = sound
      await sound.playAsync()
    } catch (err) {
      console.error('Play Sound Error', err)
    }
  }

  return (
    <View>
      <TouchableOpacity onPressIn={startRecording} onPressOut={stopRecording}>
        <Icon name='microphone' size={size} style={styles.recordBtn} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  recordBtn: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
})
