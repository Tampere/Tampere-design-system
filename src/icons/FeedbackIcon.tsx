import type { SVGProps } from 'react';

export const FeedbackIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M5.25488 8.01074L2 9.70605V22H22V9.70605L18.5068 7.88672L19.4307 6.11328L24 8.49316V24H0V8.49316L4.33105 6.2373L5.25488 8.01074Z" />
      <path d="M23.5371 11.8438L12.0107 19.1855L0.463867 11.8438L1.53613 10.1562L12.0088 16.8145L22.4629 10.1562L23.5371 11.8438Z" />
      <path d="M20 0V14H18V2H6V14H4V0H20Z" />
      <path d="M16.666 6.74609L11.5166 11.3428L8.33105 8.47656L9.66895 6.98926L11.5215 8.65625L15.334 5.25391L16.666 6.74609Z" />
    </svg>
  );
};
