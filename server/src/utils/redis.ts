import Bull from 'bull';
import { EmailData } from '../types';
import { config } from '../config/configuration';

const bullOptions = config.REDIS_URL
  ? { redis: config.REDIS_URL }
  : {
      redis: {
        port: Number(config.REDIS_PORT ?? 6379),
        host: config.REDIS_HOST ?? 'redis',
        password: config.REDIS_PASSWORD || undefined,
      },
    };

export const emailQueue = new Bull('emailQueue', bullOptions);

export const addEmailToQueue = async (data: EmailData) => {
    await emailQueue.add(data, {
        // jobId: `email-${data.to}-${Date.now()}`,
        attempts: 3,
        backoff: 5000,
        removeOnComplete: true,
    });
};
