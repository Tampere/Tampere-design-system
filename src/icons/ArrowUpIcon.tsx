import type { SVGProps } from 'react';

export const ArrowUpIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21.4265 11.3829L20.0134 12.798L12.9998 5.79114V22.1202H10.9998V5.79211L3.98706 12.798L2.573 11.3829L11.9998 1.96692L21.4265 11.3829Z" />
    </svg>
  );
};
