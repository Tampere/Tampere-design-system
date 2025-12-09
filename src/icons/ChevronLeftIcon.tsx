import type { SVGProps } from 'react';

export const ChevronLeftIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M15.207 20.207L7 12L15.207 3.79297L16.6211 5.20703L9.82812 12L16.6211 18.793L15.207 20.207Z" />
    </svg>
  );
};
