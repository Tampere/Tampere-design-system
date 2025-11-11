export function DocumentCountIcon({ count }: { count: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="37"
      height="36"
      viewBox="0 0 37 36"
      fill="none"
    >
      <g clipPath="url(#clip0_464_12566)">
        <path
          d="M4.25522 4.35678H17.7261V9.74514H23.1144H25.8086V7.84035L19.631 1.6626H4.25522C3.54068 1.6626 2.85539 1.94645 2.35014 2.4517C1.84489 2.95697 1.56104 3.64224 1.56104 4.35678V28.6044C1.56104 29.319 1.84489 30.0042 2.35014 30.5094C2.85539 31.0148 3.54068 31.2986 4.25522 31.2986H23.1144C24.6024 31.2986 25.8086 30.0924 25.8086 28.6044H4.25522V4.35678Z"
          fill="#52525B"
        />
        <text
          x={count > 9 ? "50%" : "40%"}
          y="69%"
          fontSize="15"
          fontWeight={600}
          fill="#52525B"
          textAnchor="middle"
        >
          {count}
        </text>
      </g>
      <defs>
        <clipPath id="clip0_464_12566">
          <rect
            width="36"
            height="36"
            fill="white"
            transform="translate(0.814697)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
