import { useRedisClient, useRedisPublisher, useRedisSubscriber } from '~utils/redisClient';

export default async () => {
  console.log('Redis Client Loading...');
  const startTime = new Date().getTime();

  const client = useRedisClient();
  if (!client.isOpen) await client.connect();

  const publisher = useRedisPublisher();
  if (!publisher.isOpen) await publisher.connect();

  const subscriber = useRedisSubscriber();
  if (!subscriber.isOpen) await subscriber.connect();

  const endTime = new Date().getTime();
  const secondDiffing = ((endTime - startTime) / 3600).toFixed(2);
  console.log(`Redis Client Loaded In ${secondDiffing}s`);
};
