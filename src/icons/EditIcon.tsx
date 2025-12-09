import type { SVGProps } from 'react';

export const EditIcon = ({ width = 24, ...props }: SVGProps<SVGSVGElement>) => {
  return (
    <svg
      width={width}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M24.415 4.58594L11.3047 17.6963L4.62305 19.3779L6.30273 12.6855L6.49902 12.4902L19.4023 -0.413086L24.415 4.58594ZM8.10742 13.709L7.37598 16.6221L10.2793 15.8916L21.584 4.58691L19.4033 2.41309L8.10742 13.709Z" />
      <path d="M11.3075 16.2525L10.6005 16.9605L9.89246 17.6675L6.16297 13.937L7.57703 12.523L11.3075 16.2525Z" />
      <path d="M21.0465 6.51172L19.6334 7.92773L15.9039 4.20801L17.3161 2.79199L21.0465 6.51172Z" />
      <path d="M12 1V3H2V22H21V12H23V24H0V1H12Z" />
    </svg>
  );
};
