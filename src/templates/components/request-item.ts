import { ListItem } from './list-item';

interface RequestItemProps {
  content: string;
}

export const RequestItem = (props: RequestItemProps) => {
  return ListItem({
    className: 'msg-request ml-auto rounded-l-[16px] rounded-tr-[16px] rounded-br-[8px]',
    content: props.content
  });
};
