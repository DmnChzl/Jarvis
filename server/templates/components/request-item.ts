import { ListItem } from './list-item';

interface RequestItemProps {
  content: string;
}

export const RequestItem = (props: RequestItemProps) => {
  return ListItem({
    className: 'text-neutral-900 bg-lime-200 ml-auto rounded-l-[16px] rounded-tr-[16px] rounded-br-[8px]',
    content: props.content
  });
};
