import { ListItem } from './list-item';

interface ResponseItemProps {
  content: string;
}

export const ResponseItem = (props: ResponseItemProps) => {
  return ListItem({
    className: 'msg-response mr-auto rounded-r-[16px] rounded-tl-[8px] rounded-bl-[16px]',
    content: props.content
  });
};
