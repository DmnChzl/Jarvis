import { describe, expect, it } from 'vitest';
import { html, htmlInline } from './render';

describe('render', () => {
  it('should render html as string', () => {
    const tpl = html`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="circle-icon">
        <circle cx="12" cy="12" r="10" />
      </svg>
    `;

    expect(tpl.split('\n').length).toBeGreaterThan(1);
  });

  it('should render html as inline string', () => {
    const tpl = htmlInline`
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="plus-icon">
        <path d="M5 12h14"/>
        <path d="M12 5v14"/>
      </svg>
    `;

    expect(tpl.split('\n')).toHaveLength(1);
  });
});
