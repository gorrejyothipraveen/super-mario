import 'dotenv/config'
import app from './app.js'
import config from './config/index.js'

app.listen(config.port, () => {
  console.log(`Server running in ${config.nodeEnv} mode on port ${config.port}`)
})
