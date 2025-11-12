interface Props {
  rotate?: number;
  fill?: string;
}

export function ArrowRightIcon({ rotate, fill }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="17"
      viewBox="0 0 14 17"
      fill="none"
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <path
        d="M13.3506 8.49805L5.25098 16.5L4.2666 15.5283L10.6875 9.18555H0.333008V7.81152H10.6885L4.26758 1.47168L5.25098 0.5L13.3506 8.49805Z"
        fill={fill ?? '#9999A0'}
      />
    </svg>
  );
}
