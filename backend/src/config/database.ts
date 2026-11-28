import mongoose from 'mongoose';
import { env } from './env.js';
import { AppError } from '../common/errors/AppError.js';

/** Connect to MongoDB using the URI from the env configuration. */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.info('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    // Throw a consistent AppError so callers can map to HTTP 500
    throw new AppError('Failed to connect to MongoDB', 500);
  }
}

/** Gracefully close the MongoDB connection. */
export async function closeDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.info('✅ MongoDB disconnected');
  } catch (error) {
    console.error('❌ Error during MongoDB disconnect:', error);
  }
}

