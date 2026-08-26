import type { SVGProps } from 'react';

export const CheckmarkIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M21.7471 5.66406L9.04297 19.957L2.29297 13.207L3.70703 11.793L8.95703 17.043L20.2529 4.33594L21.7471 5.66406Z" />
    </svg>
  );
};
