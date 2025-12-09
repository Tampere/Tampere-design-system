import type { SVGProps } from 'react';

export const MailIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22 6V18H2V6H22ZM24 4H0V20H24V4Z" />
      <path d="M23.5625 5.82715L11.9688 13.71L0.436523 5.83594L1.56348 4.18457L11.9707 11.2891L22.4375 4.17285L23.5625 5.82715Z" />
    </svg>
  );
};
