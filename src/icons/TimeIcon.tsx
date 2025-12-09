import type { SVGProps } from 'react';

export const TimeIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12ZM24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" />
      <path d="M13 1.5V3.5H11V1.5H13Z" />
      <path d="M13 20.5V22.5H11V20.5H13Z" />
      <path d="M22.5 11V13H20.5V11H22.5Z" />
      <path d="M11.9736 10.7529L15.8857 7.71094L17.1143 9.28906L12.0254 13.2471L4.41895 7.81348L5.58105 6.18652L11.9736 10.7529Z" />
      <path d="M3.5 11V13H1.5V11H3.5Z" />
    </svg>
  );
};
