import type { SVGProps } from 'react';

export const ArrowRightIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22.4141 12L12.707 21.707L11.293 20.293L19.5859 12L11.293 3.70703L12.707 2.29297L22.4141 12Z" />
      <path d="M21 11V13H2V11H21Z" />
    </svg>
  );
};
