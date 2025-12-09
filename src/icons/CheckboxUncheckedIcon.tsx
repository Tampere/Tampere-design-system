import type { SVGProps } from 'react';

export const CheckboxUncheckedIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22 2V22H2V2H22ZM24 0H0V24H24V0Z" />
    </svg>
  );
};
