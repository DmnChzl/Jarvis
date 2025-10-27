import { useRedisGetSet, useRedisPubSub } from '~utils/redisClient';

export default async () => {
  console.log('Redis Client Loading...');
  const startTime = new Date().getTime();

  const client = useRedisGetSet();
  if (!client.isOpen) await client.connect();

  const [pubClient, subClient] = useRedisPubSub();
  if (!pubClient.isOpen) await pubClient.connect();
  if (!subClient.isOpen) await subClient.connect();

  const endTime = new Date().getTime();
  const secondDiffing = ((endTime - startTime) / 3600).toFixed(2);
  console.log(`Redis Client Loaded In ${secondDiffing}s`);
};
