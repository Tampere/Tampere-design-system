import type { SVGProps } from 'react';

export function CheckboxUncheckedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 2H2V22H22V2ZM0 0V24H24V0H0Z"
        fill="#686872"
      />
    </svg>
  );
}
