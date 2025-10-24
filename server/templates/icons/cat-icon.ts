import { html } from '@server/utils/render';

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export const CatIcon = ({ className, width = 24, height = 24, strokeWidth = 2 }: IconProps) => html`
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
    class="cat-icon${className ? ` ${className}` : ''}">
    <path
      d="M12.0001 5.00002C12.6701 5.00002 13.3501 5.09002 14.0001 5.26002C15.7801 3.26002 19.0301 2.42002 20.4201 3.00002C21.8201 3.58002 20.0001 10 20.0001 10C20.5701 11.07 21.0001 12.24 21.0001 13.44C21.0001 17.9 16.9701 21 12.0001 21C7.03008 21 3.00008 18 3.00008 13.44C3.00008 12.19 3.50008 11.04 4.00008 10C4.00008 10 2.11008 3.58002 3.50008 3.00002C4.89008 2.42002 8.22008 3.23002 10.0001 5.23002C10.6561 5.07913 11.3269 5.00198 12.0001 5.00002Z" />
    <path d="M15 13V15" />
    <path d="M9 13V15" />
  </svg>
`;
