import { createClient } from 'redis';
import { REDIS_URL } from '../env';

const redisClient = createClient({ url: REDIS_URL });

redisClient.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redisClient.on('ready', () => {
  console.log('✅ Redis client ready');
});

redisClient.connect().catch((err) => {
  console.error('Failed to connect to Redis:', err);
  console.error('REDIS_URL:', REDIS_URL);
});

export default redisClient;
