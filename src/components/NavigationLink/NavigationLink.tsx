import type { AnchorHTMLAttributes, ReactElement } from 'react';
import cx from 'clsx';
import { linkSize, linkVariant, selected } from './NavigationLink.css';

type NavigationLinkVariant = 'default' | 'inverted';
type NavigationLinkSize = 'sm' | 'md';

export interface NavigationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  isSelected?: boolean;
  className?: string;
  variant?: NavigationLinkVariant;
  size?: NavigationLinkSize;
  renderLink?: (className: string) => ReactElement;
}

/**
 * NavigationLink component for internal navigation in Header and Footer.
 * Displays a selected state when the link's page is currently active.
 *
 * - Renders an <a> tag by default when renderLink is not provided
 */
export function NavigationLink({
  href,
  isSelected = false,
  children,
  className,
  variant = 'default',
  size = 'md',
  renderLink,
  ...props
}: NavigationLinkProps) {
  const classes = cx(
    linkSize[size],
    linkVariant[variant],
    { [selected[variant]]: isSelected },
    className
  );

  if (renderLink) {
    return renderLink(classes);
  }

  return <a href={href} className={classes} children={children} {...props} />;
}
