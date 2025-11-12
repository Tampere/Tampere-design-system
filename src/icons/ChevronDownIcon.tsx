interface Props {
  rotate?: number;
  fill?: string;
}

export function ChevronDownIcon({ rotate, fill }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...(rotate && {
        style: { transform: `rotate(${rotate.toString()}deg)` },
      })}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.6774 16.7596L21.7325 8.84066C21.9037 8.69346 22 8.493 22 8.28386C22 8.07473 21.9037 7.87426 21.7325 7.72706L21.1621 7.23213C20.9924 7.08357 20.7614 7 20.5204 7C20.2793 7 20.0483 7.08357 19.8787 7.23213L12.0357 14.0375L4.19263 7.23213C4.02298 7.08357 3.79195 7 3.55093 7C3.3099 7 3.07887 7.08357 2.90923 7.23213L2.26752 7.78893C2.09632 7.93613 2 8.13659 2 8.34573C2 8.55486 2.09632 8.75533 2.26752 8.90253L11.3939 16.8215C11.7797 17.0813 12.3271 17.0549 12.6774 16.7596Z"
        fill={fill ?? '#3E3E45'}
      />
    </svg>
  );
}
