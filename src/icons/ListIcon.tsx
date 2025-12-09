import type { SVGProps } from 'react';

export const ListIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M24 6V8H5V6H24Z" />
      <path d="M24 11V13H5V11H24Z" />
      <path d="M24 16V18H5V16H24Z" />
      <path d="M2 7C2 7.55228 1.55228 8 1 8C0.447715 8 0 7.55228 0 7C0 6.44772 0.447715 6 1 6C1.55228 6 2 6.44772 2 7Z" />
      <path d="M2 12C2 12.5523 1.55228 13 1 13C0.447715 13 0 12.5523 0 12C0 11.4477 0.447715 11 1 11C1.55228 11 2 11.4477 2 12Z" />
      <path d="M2 17C2 17.5523 1.55228 18 1 18C0.447715 18 0 17.5523 0 17C0 16.4477 0.447715 16 1 16C1.55228 16 2 16.4477 2 17Z" />
    </svg>
  );
};
