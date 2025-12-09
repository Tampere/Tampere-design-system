import type { SVGProps } from 'react';

export const ReadspeakerIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 23 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M20.4912 12.4326C23.4097 14.9592 23.5368 19.0779 20.6611 21.5674L19.6787 20.4326C21.8145 18.5837 21.7862 15.539 19.5088 13.5674L20.4912 12.4326Z" />
      <path d="M15.5 24H0V0H18V7L16 8.5V2H2V22H13L15.5 24Z" />
      <path d="M9 10V12H4V10H9Z" />
      <path d="M14 7V9H4V7H14Z" />
      <path d="M14 4V6H4V4H14Z" />
      <path d="M17.9965 9.0033L12 14H9V19H12L18 24V9L17.9965 9.0033Z" />
      <path d="M19.4902 14.4326C21.1105 15.833 21.1984 18.1644 19.5752 19.5674L18.5947 18.4326C19.4768 17.6702 19.4876 16.4126 18.5098 15.5674L19.4902 14.4326Z" />
    </svg>
  );
};
