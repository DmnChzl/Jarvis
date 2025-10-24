import { loadAstProcessors, loadMdProcessors } from '@server/utils/parser';

export default async () => {
  console.log('Unified Processors Loading...');
  const startTime = new Date().getTime();
  await loadAstProcessors();
  await loadMdProcessors();
  const endTime = new Date().getTime();
  const secondDiffing = ((endTime - startTime) / 3600).toFixed(2);
  console.log(`Unified Processors Loaded In ${secondDiffing}s`);
};
