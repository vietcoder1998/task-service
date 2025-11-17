import { createClient } from 'redis';
import { config } from '../config/env.config';

const redisClient = createClient({ url: config.database.redis.url });

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
  console.error('REDIS_URL:', config.database.redis.url);
});

export default redisClient;
