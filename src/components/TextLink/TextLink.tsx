import type { AnchorHTMLAttributes, ReactElement } from 'react';
import cx from 'clsx';
import { OpenExternalLinkIcon } from '../../icons';
import { size as sizeStyles, link, externalIcon } from './TextLink.css';

export type TextLinkSize = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'subheader' | 'p1' | 'p2' | 'caption';

export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  size?: TextLinkSize;
  visited?: boolean;
  openExternal?: boolean;
  className?: string;
  renderLink?: (className: string) => ReactElement;
}

export function TextLink({
  href,
  size = 'p1',
  visited = false,
  openExternal = false,
  children,
  className,
  renderLink,
  ...props
}: TextLinkProps) {
  const classes = cx(sizeStyles[size], visited ? link.visited : link.unvisited, className);

  if (renderLink) {
    return renderLink(classes);
  }

  return (
    <a
      href={href}
      className={classes}
      target={openExternal ? '_blank' : undefined}
      rel={openExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
      {openExternal && <OpenExternalLinkIcon aria-hidden className={externalIcon} />}
    </a>
  );
}
