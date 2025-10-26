import { html } from '~utils/render';

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
    <path d="M15 20V18" />
    <path d="M9 20V18" />
    <path
      d="M18 6H6C4.89543 6 4 6.89543 4 8V16C4 17.1046 4.89543 18 6 18H18C19.1046 18 20 17.1046 20 16V8C20 6.89543 19.1046 6 18 6Z" />
    <path d="M15 11V13" />
    <path d="M9 11V13" />
    <path d="M20 12H22" />
    <path d="M2 12H4" />
    <path d="M15 6V4" />
    <path d="M9 6V4" />
  </svg>
`;
