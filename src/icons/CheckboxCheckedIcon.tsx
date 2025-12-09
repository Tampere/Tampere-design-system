import type { SVGProps } from 'react';

export const CheckboxCheckedIcon = ({
  width = 24,
  height = 24,
  ...props
}: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22 2V22H2V2H22ZM24 0H0V24H24V0Z" />
      <path d="M19.7432 7.66895L10.0381 18.4521L5.29297 13.707L6.70703 12.293L9.96094 15.5469L18.2568 6.33105L19.7432 7.66895Z" />
    </svg>
  );
};
