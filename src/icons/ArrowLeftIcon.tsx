import type { SVGProps } from 'react';

export const ArrowLeftIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12.7073 3.70703L4.41431 12L12.7073 20.293L11.2932 21.707L1.58618 12L11.2932 2.29297L12.7073 3.70703Z" />
      <path d="M22.0002 11V13H4.00024V11H22.0002Z" />
    </svg>
  );
};
