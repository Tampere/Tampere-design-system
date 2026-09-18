import type { ReactNode } from 'react';
import cx from 'clsx';
import { root } from './SkipLink.css';

export interface SkipLinkProps {
  /** id of the page's <main> landmark. Default '#main-content' by convention. */
  href?: string;
  /** Visible + accessible label. Default is Figma's own copy. */
  children?: ReactNode;
  className?: string;
}

export function SkipLink({
  href = '#main-content',
  children = 'Hyppää pääsisältöön',
  className,
}: SkipLinkProps) {
  return (
    <a href={href} className={cx(root, className)}>
      {children}
    </a>
  );
}
