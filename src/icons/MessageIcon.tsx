import type { SVGProps } from 'react';

export const MessageIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11 10V12H4V10H11Z" />
      <path d="M20 6V8H4V6H20Z" />
      <path d="M24 1V17.0771H11.7002L4.95996 23.2793V17.0771H0V1H24ZM2 15.0771H6.95996V18.7207L10.6328 15.3408L10.9199 15.0771H22V3H2V15.0771Z" />
    </svg>
  );
};
