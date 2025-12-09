import type { SVGProps } from 'react';

export const FacebookIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 0C18.627 0 24 5.382 24 12.021C24 17.6367 20.156 22.3517 14.96 23.6723V16.0378H16.97L16.99 16.028L18.36 13.0228H14.979V10.5184C14.979 10.5184 15.04 10.3292 15.05 10.2983C15.1 10.1882 15.24 10.0978 15.35 10.0576C15.38 10.0476 15.57 9.99796 15.58 9.99796H17.67V7.02205H13.99C12.237 7.23806 11.257 8.23795 11.034 9.93046L11 10.2777V13.0326H8.21V16.0378H11V24C4.841 23.4909 0 18.3227 0 12.021C0 5.382 5.373 0 12 0Z" />
    </svg>
  );
};
