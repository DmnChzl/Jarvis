import { getRedisClient } from '@server/utils/redis-client';

export default async () => {
  console.log('Redis Client Loading...');
  const startTime = new Date().getTime();
  const [pubClient, subClient] = getRedisClient();
  if (!pubClient.isOpen) await pubClient.connect();
  if (!subClient.isOpen) await subClient.connect();
  const endTime = new Date().getTime();
  const secondDiffing = ((endTime - startTime) / 3600).toFixed(2);
  console.log(`Redis Client Loaded In ${secondDiffing}s`);
};
