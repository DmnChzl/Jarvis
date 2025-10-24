import { html } from '@server/utils/render';

export interface ListItemProps {
  className?: string;
  content: string;
  style?: string;
}

export const ListItem = ({ className, content, style }: ListItemProps) => {
  return html`<li
    class="flex flex-col gap-y-2 max-w-full md:max-w-[768px] p-4${className ? ` ${className}` : ''}"
    ${style ? `style="${style}"` : ''}>
    ${content}
  </li>`;
};
