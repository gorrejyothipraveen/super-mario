import 'dotenv/config'
import app from './app.js'
import config from './config/index.js'
import { logger } from './utils/logger.js'

process.on('uncaughtException', err => {
  logger.error('uncaughtException', { message: err.message, stack: err.stack })
  process.exit(1)
})

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason)
  logger.error('unhandledRejection', { message: msg })
})

app.listen(config.port, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${config.port}`)
})
