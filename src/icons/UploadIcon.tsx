import type { SVGProps } from 'react';

export const UploadIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M2.29297 9.79297L11.9893 0.0859375L21.707 9.79297L20.293 11.207L11.9912 2.91406L3.70703 11.207L2.29297 9.79297Z" />
      <path d="M11 20V2H13V20H11Z" />
      <path d="M3 17V22H21V17H23V24H1V17H3Z" />
    </svg>
  );
};
