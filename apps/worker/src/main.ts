// Loads the repo-root .env before anything reads process.env (DECISIONS D-03).
import '@avida/db/env';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import pino from 'pino';
import { DEFAULT_JOB_OPTIONS, QUEUES } from './queues.js';

const log = pino({ name: 'worker' });

/**
 * Phase 0 — the worker process boots, connects, and registers every queue from
 * §5.8. Processors arrive in Phase 2; starting the process now means the
 * deployment path and the Redis connection are proven before they carry work.
 */
async function main() {
  const url = process.env.REDIS_URL;
  if (!url) throw new Error('REDIS_URL is required');

  const connection = new IORedis(url, { maxRetriesPerRequest: null });
  const queues = Object.values(QUEUES).map(
    (q) => new Queue(q.name, { connection, defaultJobOptions: DEFAULT_JOB_OPTIONS }),
  );

  log.info({ queues: queues.map((q) => q.name) }, 'worker ready — no processors registered yet (Phase 2)');

  const shutdown = async () => {
    await Promise.all(queues.map((q) => q.close()));
    connection.disconnect();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((error: unknown) => {
  // pino serialises a bare Error to {} unless it is given the message.
  const e = error instanceof Error ? { message: error.message, stack: error.stack } : { error };
  log.error(e, 'worker failed to start');
  process.exit(1);
});
