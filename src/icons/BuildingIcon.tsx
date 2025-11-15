import type { SVGProps } from 'react';
import ReactDOMServer from 'react-dom/server';

export function BuildingIcon(props: SVGProps<SVGSVGElement>) {
  const defaultColor = '#22437B';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
      fill="none"
    >
      <g clipPath="url(#clip0_1620_4008)">
        <path
          d="M23 1L1 1L1 23L23 23L23 1Z"
          stroke={props.fill ?? defaultColor}
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
        <path
          d="M14 18L10 18L10 23L14 23L14 18Z"
          stroke={props.fill ?? defaultColor}
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
        <path d="M7 4L4 4L4 7L7 7L7 4Z" fill={props.fill ?? defaultColor} />
        <path d="M20 4L17 4L17 7L20 7L20 4Z" fill={props.fill ?? defaultColor} />
        <path d="M13.5 4L10.5 4L10.5 7L13.5 7L13.5 4Z" fill={props.fill ?? defaultColor} />
        <path d="M7 9L4 9L4 12L7 12L7 9Z" fill={props.fill ?? defaultColor} />
        <path d="M20 9L17 9L17 12L20 12L20 9Z" fill={props.fill ?? defaultColor} />
        <path d="M13.5 9L10.5 9L10.5 12L13.5 12L13.5 9Z" fill={props.fill ?? defaultColor} />
        <path d="M7 14L4 14L4 17L7 17L7 14Z" fill={props.fill ?? defaultColor} />
        <path d="M20 14L17 14L17 17L20 17L20 14Z" fill={props.fill ?? defaultColor} />
      </g>
      <defs>
        <clipPath id="clip0_1620_4008">
          <rect width="24" height="24" fill={props.fill ?? defaultColor} />
        </clipPath>
      </defs>
    </svg>
  );
}

export function BuildingIconString(props: SVGProps<SVGSVGElement>) {
  return ReactDOMServer.renderToStaticMarkup(BuildingIcon(props));
}

export function BuildingIconDataUrl(props: SVGProps<SVGSVGElement>) {
  const svgString = BuildingIconString(props);
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
}
