import { html } from '~utils/render';

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export const ClapperBoardIcon = ({ className, width = 24, height = 24, strokeWidth = 2 }: IconProps) => html`
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
    <path
      d="M3 11V19C3 19.5304 3.21071 20.0391 3.58579 20.4142C3.96086 20.7893 4.46957 21 5 21H19C19.5304 21 20.0391 20.7893 20.4142 20.4142C20.7893 20.0391 21 19.5304 21 19V11" />
    <path d="M15 13V15" />
    <path d="M9 13V15" />
    <path
      d="M20.2 5.99995L2.99995 11L2.09995 8.59995C1.79995 7.49995 2.39995 6.39995 3.39995 6.09995L16.9 2.09995C18 1.79995 19.1 2.39995 19.4 3.39995L20.2 5.99995Z" />
    <path d="M6.19995 5.30005L9.29995 9.20005" />
    <path d="M12.3999 3.40002L15.4999 7.40002" />
  </svg>
`;
