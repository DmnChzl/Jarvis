interface IconProps {
  className?: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export interface Agent {
  key: string;
  shortName: string;
  fullName: string;
  imgSrc: string;
  title: string;
  subTitle?: string;
  icon: (props: IconProps) => string;
  hexColor: string;
  prompt: string;
}
