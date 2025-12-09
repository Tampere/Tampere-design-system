import type { SVGProps } from 'react';

export const WarningIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M12 6.04235L20.54 20.9788H3.46L12 6.04235ZM12 2L0 23H24L12 2Z" />
      <path d="M13 9.5V16H11V9.5H13Z" />
      <path d="M13 17V19H11V17H13Z" />
    </svg>
  );
};
