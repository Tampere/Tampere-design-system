import type { SVGProps } from 'react';

export const OpenExternalLinkIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M23.9998 0V16H21.9998V2H7.99984V0H23.9998Z" />
      <path d="M23.7069 1.70703L7.70687 17.707L6.29281 16.293L22.2928 0.292969L23.7069 1.70703Z" />
      <path d="M7.5 9.00001V11H2V22H13V16.5H15V24H0V9.00001H7.5Z" />
    </svg>
  );
};
