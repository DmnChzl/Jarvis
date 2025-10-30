import { eventHandler, sendRedirect } from 'h3';

// https://nitro.build/guide/routing
export default eventHandler((event) => {
  const sessionId = crypto.randomUUID();
  return sendRedirect(event, `/chat/${sessionId}?agentKey=j4rv1s`);
});
