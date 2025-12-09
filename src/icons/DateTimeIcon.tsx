import type { SVGProps } from 'react';

export const DateTimeIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22 16.5C22 13.4624 19.5376 11 16.5 11C13.4624 11 11 13.4624 11 16.5C11 19.5376 13.4624 22 16.5 22C19.5376 22 22 19.5376 22 16.5ZM24 16.5C24 20.6421 20.6421 24 16.5 24C12.3579 24 9 20.6421 9 16.5C9 12.3579 12.3579 9 16.5 9C20.6421 9 24 12.3579 24 16.5Z" />
      <path d="M17.5 13V16.7695L19.9785 18.1221L19.0215 19.8779L15.5 17.957V13H17.5Z" />
      <path d="M7 0V4H5V0H7Z" />
      <path d="M11 0V4H9V0H11Z" />
      <path d="M15 0V4H13V0H15Z" />
      <path d="M20 1V10.501H18V3H2V19H10.7305V21H0V1H20Z" />
      <path d="M19 6V8H1V6H19Z" />
    </svg>
  );
};
