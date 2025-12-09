import type { SVGProps } from 'react';

export const CreditCardIcon = ({ width = 24, height = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22 5.40039C22 5.17948 21.8205 5 21.5996 5H2.40039C2.17948 5 2 5.17948 2 5.40039V17.5996C2 17.8205 2.17948 18 2.40039 18H21.5996C21.8205 18 22 17.8205 22 17.5996V5.40039ZM24 17.5996C24 18.9251 22.9251 20 21.5996 20H2.40039C1.07491 20 0 18.9251 0 17.5996V5.40039C0 4.07491 1.07491 3 2.40039 3H21.5996C22.9251 3 24 4.07491 24 5.40039V17.5996Z" />
      <path d="M23 6V8H1V6H23Z" />
      <path d="M17 11V13H4V11H17Z" />
      <path d="M8 14V16H4V14H8Z" />
    </svg>
  );
};
