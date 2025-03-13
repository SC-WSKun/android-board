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

export { log, mapLog }
