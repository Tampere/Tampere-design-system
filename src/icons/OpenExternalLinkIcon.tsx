interface Props {
  fill?: string;
}

export function OpenExternalLinkIcon({ fill }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M24 0V16.3448H22.1368V1.86535H7.67082V0H24Z" fill={fill ?? '#3E3E45'} />
      <path
        d="M23.7273 1.59213L7.28195 18.0529L5.96427 16.734L22.4097 0.273218L23.7273 1.59213Z"
        fill={fill ?? '#3E3E45'}
      />
      <path
        d="M7.61848 8.75282V10.6182H1.8636V22.135H13.366V16.3821H15.2293V24H0V8.75282H7.61848Z"
        fill={fill ?? '#3E3E45'}
      />
    </svg>
  );
}
