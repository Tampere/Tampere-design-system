import type { SVGProps } from 'react';

export const CloseIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M23.8473 1.56705L1.56702 23.8473L0.152954 22.4333L22.4332 0.152985L23.8473 1.56705Z" />
      <path d="M23.8473 22.4333L22.4332 23.8473L0.152954 1.56705L1.56702 0.152985L23.8473 22.4333Z" />
    </svg>
  );
};
