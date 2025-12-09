import type { SVGProps } from 'react';

export const ParkingIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M16 9C16 7.35251 14.6551 6.00025 12.9785 6H7V5.56543H6V4H12.9785C15.7526 4.00025 18 6.24086 18 9C18 11.7723 15.7394 13.9997 12.9785 14H7.41895C6.64239 13.9999 6.00977 13.3784 6.00977 12.5928H8.00977C8.00961 12.2638 7.73643 12 7.41895 12H12.9785C14.6484 11.9997 16 10.6542 16 9Z" />
      <path d="M8 5V19H6V5H8Z" />
      <path d="M22 2V22H2V2H22ZM24 0H0V24H24V0Z" />
    </svg>
  );
};
