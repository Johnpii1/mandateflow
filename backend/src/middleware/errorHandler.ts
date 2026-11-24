import type { ErrorRequestHandler } from 'express'
import mongoose from 'mongoose'
import { ZodError } from 'zod'

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({ message: 'Validation failed.', errors: error.flatten().fieldErrors })
    return
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ message: 'Invalid data.', errors: error.message })
    return
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({ message: 'Invalid resource identifier.' })
    return
  }

  if (error?.code === 11000) {
    res.status(409).json({ message: 'A record with this value already exists.' })
    return
  }

  console.error(error)
  res.status(500).json({
    message: process.env.NODE_ENV === 'production' ? 'An unexpected server error occurred.' : error?.message || 'Internal server error.'
  })
}
