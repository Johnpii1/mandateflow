import type { Server } from 'node:http';
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';
import mongoose from 'mongoose';

let server: Server | undefined;

async function startServer(): Promise<void> {
  await connectDatabase();

  server = app.listen(env.PORT, () => {
    console.info(`MandateFlow API listening on port ${env.PORT}.`);
  });
}

async function shutdown(signal: string): Promise<void> {
  console.info(`${signal} received; shutting down.`);

  if (server) {
    await new Promise<void>((resolve, reject) => {
      server?.close((error) => (error ? reject(error) : resolve()));
    });
  }

  await mongoose.disconnect();
}

process.once('SIGINT', () => {
  void shutdown('SIGINT').catch((error: unknown) => {
    console.error('Shutdown failed.', error);
    process.exitCode = 1;
  });
});

process.once('SIGTERM', () => {
  void shutdown('SIGTERM').catch((error: unknown) => {
    console.error('Shutdown failed.', error);
    process.exitCode = 1;
  });
});

void startServer().catch((error: unknown) => {
  console.error('Server startup failed; check environment configuration and database availability.');
  process.exitCode = 1;
});
