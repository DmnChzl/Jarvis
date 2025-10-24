import { html } from '@server/utils/render';

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export const BotIcon = ({ className, width = 24, height = 24, strokeWidth = 2 }: IconProps) => html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="${width}"
    height="${height}"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="${strokeWidth}"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="bot-icon${className ? ` ${className}` : ''}">
    <path d="M12 21V19" />
    <path
      d="M18 7H6C4.89543 7 4 7.89543 4 9V17C4 18.1046 4.89543 19 6 19H18C19.1046 19 20 18.1046 20 17V9C20 7.89543 19.1046 7 18 7Z" />
    <path d="M15 12V14" />
    <path d="M9 12V14" />
    <path d="M20 13H22" />
    <path d="M2 13H4" />
    <path d="M12 7V3H8" />
  </svg>
`;
