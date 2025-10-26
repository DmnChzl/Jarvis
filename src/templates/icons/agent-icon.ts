import { BotIcon } from './bot-icon';
import { CatIcon } from './cat-icon';
import { ClapperBoardIcon } from './clapper-board-icon';

interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

interface AgentIconProps extends IconProps {
  agentKey: string;
}

export const AgentIcon = ({ agentKey, ...props }: AgentIconProps) => {
  switch (agentKey) {
    case 'j4rv1s':
      return BotIcon(props);
    case '3d':
      return ClapperBoardIcon(props);
    case 'm0k4':
      return CatIcon(props);
    default:
      return '';
  }
};
