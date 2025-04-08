import { consoleTransport, logger } from 'react-native-logs'

const log = logger.createLogger({
  levels: {
    debug: 0,
    info: 1,
    success: 1,
    warn: 2,
    error: 3,
  },
  severity: 'debug',
  transport: consoleTransport,
  transportOptions: {
    colors: {
      info: 'blueBright',
      success: 'greenBright',
      warn: 'yellowBright',
      error: 'redBright',
    },
    extensionColors: {
      MAP: 'cyan',
      ROS: 'magenta',
      CAR: 'cyan',
      NAV: 'white',
    },
  },
  async: true,
  dateFormat: 'time',
  printLevel: true,
  printDate: true,
  fixedExtLvlLength: false,
  enabled: true,
})

const mapLog = log.extend('MAP')
const rosLog = log.extend('ROS')
const carLog = log.extend('CAR')
const navLog = log.extend('NAV')

export { log, mapLog, rosLog, carLog, navLog }
