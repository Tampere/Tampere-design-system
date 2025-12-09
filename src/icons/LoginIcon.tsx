import type { SVGProps } from 'react';

export const LoginIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 25"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M6 2.89648L23 0V24.3691L6 21.4727V16.3369H8V19.7842L21 22V2.36816L8 4.58398V8.07324H6V2.89648Z" />
      <path d="M19.4141 12.1846L12.707 18.8916L11.293 17.4775L16.5859 12.1846L11.293 6.8916L12.707 5.47754L19.4141 12.1846Z" />
      <path d="M18 11.1846V13.1846H1V11.1846H18Z" />
    </svg>
  );
};
