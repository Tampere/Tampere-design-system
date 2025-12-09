import type { SVGProps } from 'react';

export const BarChartIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M24 22V24H0V22H24Z" />
      <path d="M5 7.02V18.02H3V7.02H5ZM7 5.02H1V20.02H7V5.02Z" />
      <path d="M13 2V18H11V2H13ZM15 0H9V20H15V0Z" />
      <path d="M21 12.02V18.02H19V12.02H21ZM23 10.02H17V20.02H23V10.02Z" />
    </svg>
  );
};
