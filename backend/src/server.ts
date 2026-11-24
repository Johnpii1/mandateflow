import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import mongoose from 'mongoose'
import { env } from './config/env.js'
import { connectDatabase } from './config/database.js'
import authRoutes from './routes/auth.routes.js'
import agentRoutes from './routes/agents.routes.js'
import requestRoutes from './routes/requests.routes.js'
import paymentRoutes from './routes/payments.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.disable('x-powered-by')
app.use(helmet())
app.use(cors({
  origin: env.CLIENT_ORIGIN.split(',').map((origin) => origin.trim()),
  credentials: false,
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json({ limit: '256kb' }))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false
}))

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'mandateflow-api',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/agents', agentRoutes)
app.use('/api/requests', requestRoutes)
app.use('/api/payments', paymentRoutes)

app.use((_req, res) => {
  res.status(404).json({ message: 'API route not found.' })
})
app.use(errorHandler)

async function start() {
  await connectDatabase()
  app.listen(env.PORT, () => {
    console.info(`MandateFlow API listening on port ${env.PORT}`)
  })
}

start().catch((error: unknown) => {
  console.error('Unable to start MandateFlow API:', error)
  process.exit(1)
})
