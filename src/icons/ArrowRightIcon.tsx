interface Props {
  rotate?: number;
  fill?: string;
}

export function ArrowRightIcon({ rotate, fill }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="21"
      height="20"
      viewBox="0 0 21 20"
      fill="none"
      style={{ transform: rotate ? `rotate(${rotate}deg)` : undefined }}
    >
      <path
        d="M20.4141 9.70703L10.707 19.4141L9.29297 18L17.5859 9.70703L9.29297 1.41406L10.707 0L20.4141 9.70703Z"
        fill={fill ?? '#3E3E45'}
      />
      <path d="M19 8.70703V10.707H0V8.70703H19Z" fill={fill ?? '#3E3E45'} />
    </svg>
  );
}
