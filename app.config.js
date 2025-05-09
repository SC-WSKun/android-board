require('ts-node/register')
const withBaiduSpeech = require('./plugins/withBaiduSpeechSDK').default
import appJson from './app.json'
module.exports = {
  ...appJson.expo,
  plugins: [withBaiduSpeech],
}
