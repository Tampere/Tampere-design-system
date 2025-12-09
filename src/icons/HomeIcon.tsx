import type { SVGProps } from 'react';

export const HomeIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 25 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M24.2324 9.71289L23 11.2871L12.1162 2.76855L1.23242 11.2871L0 9.71289L12.1162 0.230469L24.2324 9.71289Z" />
      <path d="M21.1162 8V24H14.0059V18.3398C14.0058 16.8855 13.0278 15.9805 12.1162 15.9805C11.2064 15.9805 10.2266 16.8934 10.2266 18.3398V24H3.11621V8H5.11621V22H8.22656V18.3398C8.22664 16.0864 9.82609 13.9805 12.1162 13.9805C14.4046 13.9805 16.0058 16.0744 16.0059 18.3398V22H19.1162V8H21.1162Z" />
    </svg>
  );
};
