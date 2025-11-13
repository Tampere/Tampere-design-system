interface Props {
  height?: string | number;
  width?: string | number;
  className?: string;
}

export function CrossIcon(props: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? '25'}
      height={props.height ?? '24'}
      viewBox="0 0 25 24"
      fill="none"
      className={props.className}
    >
      <path
        d="M24.1112 1.53327L13.5976 12.3635L23.4054 22.4667L21.9169 24L12.1091 13.8968L2.30548 23.9957L0.81704 22.4625L10.6207 12.3635L0.111206 1.53752L1.59965 0.004252L12.1091 10.8303L22.6228 0L24.1112 1.53327Z"
        fill="#3E3E45"
      />
    </svg>
  );
}
