import { eventHandler, getQuery, getRouterParam, sendRedirect } from 'h3';
import { findAllAgents, findOneAgent } from '~repositories/agentsRepository';
import { DefaultView } from '~templates/components/default-view';
import { AgentIcon } from '~templates/icons/agent-icon';
import { SendIcon } from '~templates/icons';
import { BaseLayout } from '~templates/layouts/base';
import { html } from '~utils/render';

interface HeaderProps {
  currentAgent: {
    key: string;
    shortName: string;
    imgSrc: string;
  };
  allAgents: {
    key: string;
    shortName: string;
    imgSrc: string;
  }[];
  sessionId: string;
}

const Header = ({ currentAgent, allAgents, sessionId }: HeaderProps) => {
  const btnGrp = allAgents
    .filter(({ key }) => key !== currentAgent.key)
    .map((agent) => {
      return html`
        <a href="/chat/${sessionId}?agentKey=${agent.key}" class="relative">
          <img width="48" height="48" src="${agent.imgSrc}" alt="Ask something to ${agent.shortName}" />
        </a>
      `;
    });

  return html`
    <header class="flex gap-x-4">
      <div class="flex gap-x-4 items-center mr-auto">
        <img width="48" height="48" src="${currentAgent.imgSrc}" alt="Logo" />
        <h1 class="font-medium text-[24px]">${currentAgent.shortName}</h1>
      </div>
      ${btnGrp}
    </header>
  `;
};

export default eventHandler(async (event) => {
  const sessionId = getRouterParam(event, 'sessionId');
  if (!sessionId) return sendRedirect(event, '/');
  const { agentKey } = getQuery<{ agentKey: string }>(event);
  const allAgents = await findAllAgents();
  const currentAgent = await findOneAgent(agentKey);
  if (!currentAgent) return sendRedirect(event, '/');

  const content = html`<div class="flex flex-col gap-y-4 size-full lg:w-[1024px] mx-auto">
    ${Header({ currentAgent, allAgents, sessionId })}

    <div
      class="flex flex-col gap-y-4 justify-end h-[calc(100%-64px)] bg-neutral-900 p-4 rounded-t-[16px] rounded-b-[32px]">
      <div
        id="msg-container"
        class="flex flex-col justify-end"
        style="height: inherit;"
        hx-get="/api/messages?sessionId=${sessionId}&agentKey=${agentKey}"
        hx-trigger="load"
        hx-swap="outerHTML">
        ${DefaultView({
          title: currentAgent.description,
          subTitle: currentAgent.longDescription ?? '',
          icon: AgentIcon({ agentKey, width: 48, height: 48, strokeWidth: 1 })
        })}
      </div>

      <form
        class="flex gap-x-4 items-center bg-neutral-800 pl-4 pr-2 py-2 rounded-t-[8px] rounded-b-[16px]"
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
        <button class="submit-request p-2 rounded-[8px]" type="submit">${SendIcon({})}</button>
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
