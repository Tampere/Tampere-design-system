import type { SVGProps } from 'react';

export const ShortcutLinkIcon = ({
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
      <path d="M20.4141 12L12.707 19.707L11.293 18.293L17.5859 12L11.293 5.70703L12.707 4.29296L20.4141 12Z" />
      <path d="M19.4004 11V13H4V11H19.4004Z" />
    </svg>
  );
};
