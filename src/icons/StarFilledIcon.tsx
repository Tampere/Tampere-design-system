import type { SVGProps } from 'react';

export const StarFilledIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 19.0439L4.58455 23.5L6.50104 15.017L0 9.28595L8.60543 8.50329L12 0.5L15.3946 8.50329L24 9.28595L17.499 15.017L19.4154 23.5L12 19.0439Z" />
    </svg>
  );
};
