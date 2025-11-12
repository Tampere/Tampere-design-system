import { SVGProps } from 'react';
import ReactDOMServer from 'react-dom/server';

export function StructureIcon(props: SVGProps<SVGSVGElement>) {
  const defaultColor = '#0074A4';
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      {...props}
      fill="none"
    >
      <path
        d="M7 19.9613L7 12.4613L12.8065 16.0903M7 19.9613L12.8065 16.0903M7 19.9613L7 12.5M7 19.9613L4 19.9613L4 13.5387M12.8065 16.0903L19 19.9613L19 11.9613M12.8065 16.0903L19 11.9613M19 9.46127L19 11.9613M1.02979 10.6658L22.1747 5L22.9915 8.04823L1.84656 13.714L1.02979 10.6658Z"
        stroke={props.fill ?? defaultColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function StructureIconString(props: SVGProps<SVGSVGElement>) {
  return ReactDOMServer.renderToStaticMarkup(StructureIcon(props));
}

export function StructureIconDataUrl(props: SVGProps<SVGSVGElement>) {
  const svgString = StructureIconString(props);
  return `data:image/svg+xml;base64,${btoa(svgString)}`;
}
