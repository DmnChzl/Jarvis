import { ListItem } from './list-item';

interface ResponseItemProps {
  content: string;
  bgColor?: string;
}

export const ResponseItem = ({ bgColor = 'var(--response-color)', ...props }: ResponseItemProps) => {
  return ListItem({
    className: 'msg-response text-white mr-auto rounded-r-[16px] rounded-tl-[8px] rounded-bl-[16px]',
    content: props.content,
    style: `background-color: ${bgColor};`
  });
};
