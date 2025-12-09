import type { SVGProps } from 'react';

export const LockIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M19 8.00334V21.9967H5V8.00334H19ZM21 6H3V24H21V6Z" />
      <path d="M16 6.12598C15.9999 3.8224 14.1869 2 12 2C9.81308 2 8.00009 3.8224 8 6.12598V8H6V6.12598C6.00009 2.7651 8.66183 1.24866e-07 12 0C15.3382 0 17.9999 2.7651 18 6.12598V8H16V6.12598Z" />
      <path d="M13 15V19H11V15H13Z" />
      <path d="M12 16C13.1046 16 14 15.1046 14 14C14 12.8954 13.1046 12 12 12C10.8954 12 10 12.8954 10 14C10 15.1046 10.8954 16 12 16Z" />
    </svg>
  );
};
