import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import { createProxyMiddleware } from 'http-proxy-middleware'
import healthRouter from './routes/health.js'
import scoresRouter from './routes/scores.js'
import savesRouter from './routes/saves.js'
import levelsRouter from './routes/levels.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'
import config from './config/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api', healthRouter)
app.use('/api/scores', scoresRouter)
app.use('/api/saves', savesRouter)
app.use('/api/levels', levelsRouter)

if (config.nodeEnv === 'production') {
  const distPath = path.join(__dirname, '../frontend/dist')
  app.use(express.static(distPath))
  app.get('*', (req, res) =>
    res.sendFile(path.join(distPath, 'index.html'))
  )
} else if (config.nodeEnv === 'development') {
  app.use(
    createProxyMiddleware({
      target: 'http://localhost:5173',
      changeOrigin: true,
      ws: true,
      on: {
        error: (_err, _req, res) =>
          res.status(502).send('Frontend dev server not running — start it with: npm run dev --prefix frontend'),
      },
    })
  )
} else {
  app.use(notFound)
}

app.use(errorHandler)

export default app
