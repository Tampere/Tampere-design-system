import type { SVGProps } from 'react';

export const LogoutIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M11 3.70508L2 2.18359V21.8154L10.9902 20.2939V16.1113H12.9902V21.9844L0 24.1836V-0.183594L13 2.01562V7.84766H11V3.70508Z" />
      <path d="M23.4141 12L16.707 18.707L15.293 17.293L20.5859 12L15.293 6.70703L16.707 5.29297L23.4141 12Z" />
      <path d="M22 11V13H5V11H22Z" />
    </svg>
  );
};
