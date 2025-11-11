import { SVGProps } from "react";

export function CheckboxCheckedIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <path
        d="M24 0V24H0V0H24ZM1.56168 22.4386H22.4386V1.56168H1.56168V22.4386ZM20.459 6.85824L9.96415 18.1878L4.43793 13.2072L5.48334 12.0473L9.86555 15.9965L19.3134 5.79721L20.459 6.85824Z"
        fill={props.fill ?? "#29549A"}
      />
    </svg>
  );
}
