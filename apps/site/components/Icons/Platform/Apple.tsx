import type { FC, SVGProps } from 'react';

const Apple: FC<SVGProps<SVGSVGElement>> = props => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 32 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M30 16c0 7.728-6.265 14-14 14S2 23.728 2 16C2 8.265 8.265 2 16 2s14 6.265 14 14Z"
      fill="#283544"
    />
    <path
      d="M22.562 12.457c-.076.045-1.895.986-1.895 3.07.086 2.38 2.295 3.213 2.333 3.213-.038.045-.334 1.136-1.21 2.28-.694.986-1.466 1.98-2.637 1.98-1.114 0-1.514-.657-2.8-.657-1.381 0-1.772.657-2.829.657-1.171 0-2-1.047-2.733-2.023-.952-1.278-1.761-3.284-1.79-5.21-.02-1.02.19-2.023.724-2.875.752-1.19 2.095-1.997 3.561-2.023 1.124-.036 2.124.719 2.81.719.657 0 1.885-.72 3.275-.72.6.001 2.2.17 3.191 1.59Zm-6.561-1.792c-.2-.932.352-1.864.866-2.458.657-.72 1.695-1.207 2.59-1.207a3.334 3.334 0 0 1-.952 2.511c-.58.72-1.58 1.26-2.504 1.154Z"
      fill="#fff"
    />
  </svg>
);

export default Apple;
