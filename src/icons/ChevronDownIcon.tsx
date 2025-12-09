import type { SVGProps } from 'react';

export const ChevronDownIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20.207 8.41406L12 16.6211L3.79297 8.41406L5.20703 7L12 13.793L18.793 7L20.207 8.41406Z" />
    </svg>
  );
};
