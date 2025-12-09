import type { SVGProps } from 'react';

export const ArrowDownIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12.9998 2V18.3359L20.0125 11.3232L21.4275 12.7373L12.0105 22.1533L2.57397 12.7383L3.98608 11.3223L10.9998 18.3193V2H12.9998Z" />
    </svg>
  );
};
