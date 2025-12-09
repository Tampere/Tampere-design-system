import type { SVGProps } from 'react';

export const LastPageIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21.4141 12L13.707 19.707L12.293 18.293L18.5859 12L12.293 5.70703L13.707 4.29297L21.4141 12Z" />
      <path d="M19 11V13H0V11H19Z" />
      <path d="M24 0V24H22V0H24Z" />
    </svg>
  );
};
