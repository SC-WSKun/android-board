require('ts-node/register')
import appJson from './app.json'
module.exports = {
  ...appJson.expo,
  plugins: [],
}
