import { Introduction } from '@server/templates/components/introduction';
import { SendIcon } from '@server/templates/icons';
import { BaseLayout } from '@server/templates/layouts/base';
import { getAgentByKey, getAllAgents } from '@server/utils/db';
import { html } from '@server/utils/render';
import { eventHandler, getQuery, getRouterParam, sendRedirect } from 'h3';

interface HeaderProps {
  currentAgent: {
    key: string;
    shortName: string;
    imgSrc: string;
  };
  sessionId: string;
}

const Header = ({ currentAgent, sessionId }: HeaderProps) => {
  const btnGrp = getAllAgents()
    .filter(({ key }) => key !== currentAgent.key)
    .map(
      (agent) =>
        html`<a href="/chat/${sessionId}?agentKey=${agent.key}" class="relative">
          <img width="48" height="48" src="${agent.imgSrc}" alt="Ask something to ${agent.shortName}" />
        </a>`
    );

  return html`<header class="flex gap-x-4">
    <div class="flex gap-x-4 items-center mr-auto">
      <img width="48" height="48" src="${currentAgent.imgSrc}" alt="Logo" />
      <h1 class="font-medium text-[24px]">${currentAgent.shortName}</h1>
    </div>
    ${btnGrp}
  </header>`;
};

export default eventHandler((event) => {
  const sessionId = getRouterParam(event, 'sessionId');
  if (!sessionId) return sendRedirect(event, '/');
  const { agentKey } = getQuery<{ agentKey: string }>(event);
  const currentAgent = getAgentByKey(agentKey);
  if (!currentAgent) return sendRedirect(event, '/');

  const content = html`<div class="flex flex-col gap-y-4 size-full lg:w-[1024px] mx-auto">
    ${Header({ currentAgent, sessionId })}

    <div
      class="flex flex-col gap-y-4 justify-end h-[calc(100%-64px)] bg-neutral-900 p-4 rounded-t-[16px] rounded-b-[32px]">
      <div
        id="msg-container"
        class="flex flex-col justify-end"
        style="height: inherit;"
        hx-get="/api/messages?sessionId=${sessionId}&agentKey=${agentKey}"
        hx-trigger="load"
        hx-swap="outerHTML">
        ${Introduction({
          title: currentAgent.title,
          subTitle: currentAgent.subTitle,
          icon: currentAgent.icon({ width: 48, height: 48, strokeWidth: 1 })
        })}
      </div>

      <form
        class="flex bg-neutral-800 pl-4 pr-2 py-2 rounded-t-[8px] rounded-b-[16px]"
        autocomplete="off"
        hx-post="/api/chat"
        hx-swap="none"
        hx-on::after-request="document.getElementById('msg-content').value = '';">
        <input
          class="w-full appearance-none bg-transparent outline-none placeholder:text-neutral-400"
          placeholder="Ask something..."
          id="msg-content"
          name="msgContent"
          required />
        <input type="hidden" name="sessionId" value="${sessionId}" />
        <input type="hidden" name="agentKey" value="${agentKey}" />
        <button class="text-neutral-900 bg-lime-200 hover:bg-lime-300 p-2 rounded-[8px]" type="submit">
          ${SendIcon({})}
        </button>
      </form>
    </div>
  </div>`;

  return BaseLayout({
    title: `Ask something to ${currentAgent.shortName}`,
    favicon: currentAgent.imgSrc,
    dataTheme: agentKey,
    content
  });
});
