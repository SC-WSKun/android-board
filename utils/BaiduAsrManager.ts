import { addRobotEventListener } from './eventBus'
import BaiduAsrTTS from './BaiduAsr/BaiduAsrTTS'
import BaiduAsrWakeup from './BaiduAsr/BaiduAsrWakeup'
import BaiduAsrRecognization from './BaiduAsr/BaiduAsrRecognization'

class BaiduAsrManager {
  private static members: any = {}
  actions: any = {}
  mode: string = 'normal'

  constructor() {
    this.askRobot = this.askRobot.bind(this)
    BaiduAsrManager.members.BaiduAsrTTS = new BaiduAsrTTS()
    BaiduAsrManager.members.BaiduAsrWakeup = new BaiduAsrWakeup()
    BaiduAsrManager.members.BaiduAsrRecognization = new BaiduAsrRecognization()
    addRobotEventListener('askRobot', this.askRobot)
  }

  static setUp() {
    Object.values(BaiduAsrManager.members).forEach((member: any) => {
      member.setUp()
    })
  }

  unMount() {
    Object.values(BaiduAsrManager.members).forEach((member: any) => {
      member.unMount()
    })
  }

  static setAction(action: string, callback: any) {
    this.actions[action] = callback
  }

  /**
   * 处理机器人问答
   * @param question 提问机器人的问题，由百度语音识别识别出来的
   */
  askRobot = async (question: string) => {
    console.log('ask question:', question)
  }

  speakText = (text: string) => {
    BaiduAsrManager.members.BaiduAsrTTS.speak(text)
  }
}

const baiduAsrController = new BaiduAsrManager()

export default baiduAsrController
