import type { SVGProps } from 'react';

export const ReorderIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20.207 15.707L12 23.9141L3.79297 15.707L5.20703 14.293L12 21.0859L18.793 14.293L20.207 15.707ZM20.207 8.29297L18.793 9.70703L12 2.91406L5.20703 9.70703L3.79297 8.29297L12 0.0859375L20.207 8.29297Z" />
    </svg>
  );
};
