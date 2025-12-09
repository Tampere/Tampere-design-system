import type { SVGProps } from 'react';

export const DownloadIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12.0085 17.8159L20.0124 9.81297L21.4274 11.227L12.0104 20.643L2.57393 11.228L3.98604 9.81199L12.0085 17.8159Z" />
      <path d="M13 0V19.2402H11V0H13Z" />
      <path d="M2.99637 17V22H21.0036V17H23V24H1V17H2.99637Z" />
    </svg>
  );
};
