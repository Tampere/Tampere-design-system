import type { SVGProps } from 'react';

export const QrCodeIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M8 0V2H2V8H0V0H8Z" />
      <path d="M24 0V8H22V2H16V0H24Z" />
      <path d="M24 16V24H16V22H22V16H24Z" />
      <path d="M2 16V22H8V24H0V16H2Z" />
      <path d="M15 4V11H13V4H15Z" />
      <path d="M6 13V20H4V13H6Z" />
      <path d="M20 9V11H14V9H20Z" />
      <path d="M11 18V20H5V18H11Z" />
      <path d="M9 6V9H6V6H9ZM11 4H4V11H11V4Z" />
      <path d="M8 7H7V8H8V7Z" />
      <path d="M18 4H16V6H18V4Z" />
      <path d="M20 6H18V8H20V6Z" />
      <path d="M9 13H7V15H9V13Z" />
      <path d="M11 15H9V17H11V15Z" />
      <path d="M18 15V18H15V15H18ZM20 13H13V20H20V13Z" />
      <path d="M17 16H16V17H17V16Z" />
    </svg>
  );
};
