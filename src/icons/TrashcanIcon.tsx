import type { SVGProps } from 'react';

export const TrashcanIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20.6035 5L18.8311 23H5.16895L3.39648 5H20.6035ZM6.98145 21H17.0186L18.3965 7H5.60352L6.98145 21Z" />
      <path d="M22 5V7H2V5H22Z" />
      <path d="M14 4H10V7H8V2H16V7H14V4Z" />
      <path d="M11.01 10.0011L11 19.0011L9 18.9989L9.01001 9.99889L11.01 10.0011Z" />
      <path d="M14.99 9.99889L15 18.9989L13 19.0011L12.99 10.0011L14.99 9.99889Z" />
    </svg>
  );
};
