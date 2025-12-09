import type { SVGProps } from 'react';

export const MenuIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M24 16V18H0V16H24Z" />
      <path d="M24 11V13H0V11H24Z" />
      <path d="M24 6V8H0V6H24Z" />
    </svg>
  );
};
