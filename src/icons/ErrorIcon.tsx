import type { SVGProps } from 'react';

export const ErrorIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M17.707 7.70703L13.4141 12L17.707 16.293L16.293 17.707L12 13.4141L7.70703 17.707L6.29297 16.293L10.5859 12L6.29297 7.70703L7.70703 6.29297L12 10.5859L16.293 6.29297L17.707 7.70703Z" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M24 6V18L18 24H6L0 18V6L6 0H18L24 6ZM2 6.82812V17.1719L6.82812 22H17.1719L22 17.1719V6.82812L17.1719 2H6.82812L2 6.82812Z"
      />
    </svg>
  );
};
