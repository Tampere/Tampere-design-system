import type { SVGProps } from 'react';

export const StepCheckIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12ZM24 12C24 18.6274 18.6274 24 12 24C5.37258 24 0 18.6274 0 12C0 5.37258 5.37258 0 12 0C18.6274 0 24 5.37258 24 12Z" />
      <path d="M18.7471 8.66406L10.043 18.457L5.29297 13.707L6.70703 12.293L9.95703 15.543L17.2529 7.33594L18.7471 8.66406Z" />
    </svg>
  );
};
