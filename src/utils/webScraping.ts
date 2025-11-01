import { Window } from 'happy-dom';

export const parseHtml = (url: string, html: string) => {
  const window = new Window({
    url,
    settings: {
      disableComputedStyleRendering: true,
      disableCSSFileLoading: true,
      disableJavaScriptEvaluation: true,
      disableJavaScriptFileLoading: true,
      disableIframePageLoading: true
    }
  });

  const document = window.document;
  document.write(html);

  let textContent;

  const bodyText = document.body?.textContent?.trim() || '';
  textContent = bodyText.replace(/\s+/g, ' ');

  const title = document.querySelector('title')?.textContent?.trim() || '';
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';

  const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
    .map((heading) => ({
      level: heading.tagName.toLowerCase(),
      textContent: heading.textContent?.trim() || ''
    }))
    .filter((heading) => heading.textContent.length > 0)
    .slice(0, 10); // Limit to 10 headings max

  const links = Array.from(document.querySelectorAll('a[href]'))
    .map((link) => ({
      href: link.getAttribute('href') || '',
      textContent: link.textContent?.trim() || ''
    }))
    .filter((link) => link.href.length > 0 && link.textContent.length > 0)
    .slice(0, 20); // Limit to 20 links max

  window.close();

  return {
    url,
    title,
    description,
    content: textContent.slice(0, 4096),
    headings,
    links,
    contentLength: textContent.length
  };
};
