import type { SVGProps } from 'react';

export const SwitchUncheckedIcon = ({
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
      <path d="M17.707 7.70703L7.70703 17.707L6.29297 16.293L16.293 6.29297L17.707 7.70703Z" />
      <path d="M17.707 16.293L16.293 17.707L6.29297 7.70703L7.70703 6.29297L17.707 16.293Z" />
    </svg>
  );
};
