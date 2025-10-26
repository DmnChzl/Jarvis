import { Helmet, type HelmetScript } from '~templates/layouts/helmet';
import { html } from '~utils/render';

interface BaseLayoutProps {
  title: string;
  favicon?: string;
  dataTheme?: string;
  content: string;
  scripts?: HelmetScript[];
  theme?: string;
}

export const BaseLayout = ({ title, favicon, dataTheme, content, scripts = [] }: BaseLayoutProps) => html`
  <!DOCTYPE html>
  <html lang="en">
    ${Helmet({
      title,
      favicon,
      scripts: [
        { src: 'https://cdn.jsdelivr.net/npm/htmx.org@2.0.5/dist/htmx.min.js' },
        { src: 'https://cdn.jsdelivr.net/npm/htmx-ext-sse@2.2.0' },
        { src: 'https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4' },
        ...scripts
      ],
      links: [
        { rel: 'stylesheet', href: '/fonts.css' },
        { rel: 'stylesheet', href: '/theme.css' }
      ],
      styles: `
        body {
          display: flex;
          flex-direction: column;
          height: 100dvh;
          color: #fff;
          background-color: #0a0a0a;
          font-family: 'Poppins', sans-serif;
          position: relative;
          padding: 1rem;
        }

        button:not(disabled) {
          cursor: pointer;
          outline: none;
        }

        .msg-response h1, .msg-response h2,
        .msg-response h3, .msg-response h4,
        .msg-response h5, .msg-response h6 {
          font-size: 20px;
          font-weight: 500;
        }
        .msg-response ul, .msg-response ol {}
        .msg-response pre {
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
        }
        .msg-response code {
          font-family: 'JetBrains Mono', monospace;
          display: flex;
          flex-direction: column;
        }
        .msg-response code:not(pre code) {
          display: inline;
        }

        .scrollbar-none {
          scrollbar-width: none;
        }
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `
    })}
    <body${dataTheme ? ` data-theme="${dataTheme}"` : ''}>
      ${content}
    </body>
  </html>
`;
