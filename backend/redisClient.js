import { Redis } from 'ioredis';
import 'dotenv/config';


const redis = new Redis(process.env.REDIS_URL, {

  maxRetriesPerRequest: null,
  enableReadyCheck: false,
   tls: {}
});

redis.on('connect', () => {
  console.log('✅ Redis client connected.');
});

redis.on('error', (err) => {
  console.error('❌ Redis client error:', err);
});

export default redis;