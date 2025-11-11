interface Props {
  fill?: string;
}

export function DownloadIcon({ fill }: Props) {
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.3884 8.22236L22.7503 9.52599L12.4708 19.3653L2.18737 9.52612L3.54905 8.22223L12.4697 16.7574L21.3884 8.22236Z"
        fill={fill ?? "#3E3E45"}
      />
      <path
        d="M13.4338 0V18.0618H11.5077V0H13.4338Z"
        fill={fill ?? "#3E3E45"}
      />
      <path
        d="M2.64093 15.3756V22.1564H22.7888V15.3756H24.7148V24H0.714844V15.3756H2.64093Z"
        fill={fill ?? "#3E3E45"}
      />
    </svg>
  );
}
