import type { SVGProps } from 'react';

export const FirstPageIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11.707 5.70703L5.41406 12L11.707 18.293L10.293 19.707L2.58594 12L10.293 4.29297L11.707 5.70703Z" />
      <path d="M24 11V13H5V11H24Z" />
      <path d="M2 0V24H0V0H2Z" />
    </svg>
  );
};
