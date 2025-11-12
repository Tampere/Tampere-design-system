import { SVGProps } from 'react';
import ReactDOMServer from 'react-dom/server';

export function DemolishedBuildingIcon(props: SVGProps<SVGSVGElement>) {
  const defaultColor = '#AE1E20';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
      fill="none"
    >
      <g clipPath="url(#clip0_1648_4009)">
        <path
          d="M13 13L13 18L3 18L3 15C3 13.9 3.9 13 5 13L13 13ZM13 13L13 8L7 8L7 13L13 13ZM14 18L4 18M14 23L4 23M20 10C18.3432 10 17 11.3431 17 13C17 14.6569 18.3432 16 20 16C21.6569 16 23 14.6569 23 13C23 11.3431 21.6569 10 20 10ZM20 10L20 1L13 9M14.5 23C13.1193 23 12 21.8807 12 20.5C12 19.1193 13.1193 18 14.5 18C15.8807 18 17 19.1193 17 20.5C17 21.8807 15.8807 23 14.5 23ZM3.5 23C2.1193 23 1 21.8807 1 20.5C1 19.1193 2.1193 18 3.5 18C4.8807 18 6 19.1193 6 20.5C6 21.8807 4.8807 23 3.5 23Z"
          stroke={props.fill ?? defaultColor}
          strokeWidth="2"
          strokeMiterlimit="10"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_1648_4009">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
}

export function DemolishedBuildingIconString(props: SVGProps<SVGSVGElement>) {
  return ReactDOMServer.renderToStaticMarkup(DemolishedBuildingIcon(props));
}

export function DemolishedBuildingIconDataUrl(props: SVGProps<SVGSVGElement>) {
  const svgString = DemolishedBuildingIconString(props);
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
}
