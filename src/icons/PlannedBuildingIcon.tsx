import { SVGProps } from "react";
import ReactDOMServer from "react-dom/server";

export function PlannedBuildingIcon(props: SVGProps<SVGSVGElement>) {
  const defaultColor = "#64995F";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
      fill="none"
    >
      <g clipPath="url(#clip0_1648_4085)">
        <path
          d="M19 24L19 3L16 1L13 3L13 24"
          stroke={props.fill ?? defaultColor}
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
        <path
          d="M14 5L3 5L1 9L14 9"
          stroke={props.fill ?? defaultColor}
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
        <path
          d="M23 5L19 5L19 9L23 9L23 5Z"
          stroke={props.fill ?? defaultColor}
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
        <path
          d="M4 15C4 16.1 4.9 17 6 17C7.1 17 8 16.1 8 15C8 13.9 7.1 13 6 13L6 9"
          stroke={props.fill ?? defaultColor}
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
        <path
          d="M10 20L2 20L2 23L10 23L10 20Z"
          stroke={props.fill ?? defaultColor}
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1648_4085">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function PlannedBuildingIconString(props: SVGProps<SVGSVGElement>) {
  return ReactDOMServer.renderToStaticMarkup(PlannedBuildingIcon(props));
}

export function PlannedBuildingIconDataUrl(props: SVGProps<SVGSVGElement>) {
  const svgString = PlannedBuildingIconString(props);
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
}
