import type { SVGProps } from 'react';

export const FileIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M13.3673 2.00083L16.3422 5.17215L19.0067 8.14339V21.9992H5.00334V2.00083H13.3573M14.2287 0H3V24H21V7.38308L17.8247 3.8416L14.8197 0.640267L14.2287 0Z" />
      <path d="M12 17V19H7V17H12Z" />
      <path d="M17 14V16H7V14H17Z" />
      <path d="M17 11V13H7V11H17Z" />
      <path d="M14 2V7H19V9H12V2H14Z" />
    </svg>
  );
};
