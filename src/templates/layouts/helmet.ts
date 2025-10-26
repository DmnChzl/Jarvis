import { html } from '~utils/render';

export interface HelmetMeta {
  name?: string;
  property?: string;
  content: string;
  charset?: string;
  httpEquiv?: string;
}

export interface HelmetLink {
  rel: string;
  href: string;
  type?: string;
}

export interface HelmetScript {
  src?: string;
  type?: string;
  content?: string;
  async?: boolean;
  defer?: boolean;
}

interface HelmetProps {
  title?: string;
  favicon?: string;
  meta?: HelmetMeta[];
  links?: HelmetLink[];
  scripts?: HelmetScript[];
  styles?: string;
}

export const Helmet = ({
  title = 'Untitled',
  favicon = '/favicon.svg',
  meta: _meta = [],
  links: _links = [],
  scripts = [],
  styles = ''
}: HelmetProps) => {
  const meta: HelmetMeta[] = [
    { charset: 'utf-8' } as HelmetMeta,
    { name: 'viewport', content: 'width=device-width, initial-scale=1.0' },
    ..._meta
  ];

  const links: HelmetLink[] = [{ rel: 'icon', href: favicon, type: 'image/svg+xml' }, ..._links];

  const renderMeta = (metadata: HelmetMeta) => {
    if (metadata.charset) return html`<meta charset="${metadata.charset}" />`;
    if (metadata.httpEquiv) {
      return html`<meta http-equiv="${metadata.httpEquiv}" content="${metadata.content}" />`;
    }
    if (metadata.property) {
      return html`<meta property="${metadata.property}" content="${metadata.content}" />`;
    }
    return html`<meta name="${metadata.name}" content="${metadata.content}" />`;
  };

  const renderScript = (script: HelmetScript) => {
    if (script.content) {
      return html`<script${script.type ? ` type="${script.type}"` : ''}>${script.content}</script>`;
    }

    const asyncAttr = script.async ? ' async' : '';
    const deferAttr = script.defer ? ' defer' : '';
    const typeAttr = script.type ? ` type="${script.type}"` : '';

    return html`<script src="${script.src}" ${typeAttr}${asyncAttr}${deferAttr}></script>`;
  };

  return html`
    <head>
      ${meta.map(renderMeta)}
      <title>${title}</title>
      ${links.map((link) => {
        const typeAttr = link.type ? ` type="${link.type}"` : '';
        return html`<link rel="${link.rel}" href="${link.href}" ${typeAttr} />`;
      })}
      ${scripts.map(renderScript)}
      ${styles
        ? html`<style>
            ${styles}
          </style>`
        : ''}
    </head>
  `;
};
