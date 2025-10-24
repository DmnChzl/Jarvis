import { html } from '@server/utils/render';

interface MessageContainerProps {
  sessionId?: string;
  messages: string[];
  fallback?: string;
}

export const MessageContainer = ({ sessionId, messages, fallback }: MessageContainerProps) => {
  const conversation = sessionId
    ? html`
        <ul
          id="conversation"
          class="flex flex-col gap-y-2 overflow-y-auto scroll-smooth scrollbar-none"
          hx-ext="sse"
          sse-connect="/api/chat/stream?sessionId=${sessionId}"
          sse-swap="message"
          hx-swap="beforeend"
          hx-on::after-swap="
            this.scrollTop = this.scrollHeight;
            const element = document.getElementById('introduction');
            if (element) element.remove();
          ">
          ${messages.length > 0 ? html`${messages}` : ''}
        </ul>
      `
    : '';

  return html`
    <div id="msg-container" class="flex flex-col justify-end" style="height: inherit;">
      ${conversation}${messages.length === 0 && fallback ? fallback : ''}
    </div>
  `;
};
