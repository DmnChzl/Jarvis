import { html } from '@server/utils/render';

interface IntroductionProps {
  title: string;
  subTitle?: string;
  icon?: string;
}

export const Introduction = ({ title, subTitle, icon = '' }: IntroductionProps) => html`
  <div id="introduction" class="m-auto flex flex-col">
    <div class="flex gap-x-2 items-end">
      <p class="font-medium text-[24px]">${title}</p>
      ${icon}
    </div>
    ${subTitle ? html`<p class="font-medium text-[24px]">${subTitle}</p>` : ''}
  </div>
`;
