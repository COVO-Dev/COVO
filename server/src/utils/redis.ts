import Bull from 'bull';
import { EmailData } from '../types';
import { config } from '../config/configuration';


export const emailQueue = new Bull('emailQueue', {
    redis: {
        port: Number(config.REDIS_PORT),
        host: config.REDIS_HOST,
    },
})

export const addEmailToQueue = async (data: EmailData) => {
      await emailQueue.add(data, {
        // jobId: `email-${data.to}-${Date.now()}`,
        attempts: 3,
        backoff: 5000,
        removeOnComplete: true,
    });
};
