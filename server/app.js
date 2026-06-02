import express from 'express'
import cors from 'cors'
import morgan from 'morgan'
import healthRouter from './routes/health.js'
import scoresRouter from './routes/scores.js'
import { notFound, errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(cors())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use('/api', healthRouter)
app.use('/api/scores', scoresRouter)

app.use(notFound)
app.use(errorHandler)

export default app
