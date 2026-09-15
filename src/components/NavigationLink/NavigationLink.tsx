import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react';
import cx from 'clsx';
import { linkSize, linkVariant, selected, iconWrapper, withIcon } from './NavigationLink.css';

type NavigationLinkVariant = 'default' | 'inverted';
type NavigationLinkSize = 'sm' | 'md';

export interface NavigationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  isSelected?: boolean;
  className?: string;
  variant?: NavigationLinkVariant;
  size?: NavigationLinkSize;
  /** Icon shown before the label (Figma node 3992:2329's `startIcon`) — a
   * fixed 18px regardless of `size`, spaced 8px from the label. */
  startIcon?: ReactNode;
  /** Icon shown after the label (Figma node 3992:2329's `endIcon`) — same
   * fixed size/spacing as `startIcon`. */
  endIcon?: ReactNode;
  /**
   * Renders the link in place of the default `<a>`. The second argument is
   * the derived `aria-current` value (from `isSelected`, or an explicit
   * override) — apply it to whatever element you render, it is not applied
   * for you. `startIcon`/`endIcon` are not applied either — include them in
   * your own rendered content if needed.
   */
  renderLink?: (
    className: string,
    ariaCurrent?: AnchorHTMLAttributes<HTMLAnchorElement>['aria-current']
  ) => ReactElement;
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
  startIcon,
  endIcon,
  renderLink,
  'aria-current': ariaCurrent,
  ...props
}: NavigationLinkProps) {
  const classes = cx(
    linkSize[size],
    linkVariant[variant],
    { [selected[variant]]: isSelected, [withIcon]: !!(startIcon || endIcon) },
    className
  );

  // Undefined rather than `false`: React omits the attribute entirely for
  // undefined, whereas `aria-current="false"` is a real value to AT and
  // would announce every unselected link as current.
  const currentValue = ariaCurrent ?? (isSelected ? 'page' : undefined);

  if (renderLink) {
    // renderLink owns its own anchor, so the derived value is passed as an
    // argument rather than applied — the consumer can decide how to wire it.
    return renderLink(classes, currentValue);
  }

  return (
    <a href={href} className={classes} aria-current={currentValue} {...props}>
      {startIcon ? <span className={iconWrapper}>{startIcon}</span> : null}
      {children}
      {endIcon ? <span className={iconWrapper}>{endIcon}</span> : null}
    </a>
  );
}
