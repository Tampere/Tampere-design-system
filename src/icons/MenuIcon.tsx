export function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="10"
      viewBox="0 0 24 10"
      fill="none"
    >
      <path
        d="M24 8.48804V10H0V8.48804H24Z"
        fill={props.fill ?? "currentColor"}
      />
      <path
        d="M24 4.24402V5.75598H0V4.24402H24Z"
        fill={props.fill ?? "currentColor"}
      />
      <path d="M24 0V1.51196H0V0H24Z" fill={props.fill ?? "currentColor"} />
    </svg>
  );
}
