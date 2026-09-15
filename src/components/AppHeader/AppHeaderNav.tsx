import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react';
import { NavigationLink } from '../NavigationLink';
import { navList, navItem } from './AppHeader.css';

interface AppHeaderNavigationItemBase {
  label: ReactNode;
  isSelected?: boolean;
}

/**
 * Renders the item in place of the default `<a href={href}>`. The second
 * argument is the derived `aria-current` value (from `isSelected`) — apply it
 * to whatever element you render, it is not applied for you.
 */
type RenderLink = (
  className: string,
  ariaCurrent?: AnchorHTMLAttributes<HTMLAnchorElement>['aria-current']
) => ReactElement;

// `href` and `renderLink` were both optional, so an item with neither rendered
// an `<a>` with no href — inert, and not exposed to AT as a link. A
// discriminated union makes one of the two required at compile time, using
// the same technique as Button.tsx's `iconOnly`/`aria-label` pairing.
export type AppHeaderNavigationItem =
  | (AppHeaderNavigationItemBase & { href: string; renderLink?: undefined })
  | (AppHeaderNavigationItemBase & { href?: undefined; renderLink: RenderLink });

export interface AppHeaderNavProps {
  items: AppHeaderNavigationItem[];
  ariaLabel: string;
  className?: string;
  /** NavigationLink's own size — 'md' (default) for the primary nav, 'sm' for
   * AppHeader's secondary navigation (Figma node 14151:15442). */
  size?: 'sm' | 'md';
  /** Called after a link/button inside any item is activated (e.g. to close a
   * containing menu). Delegated at the `<li>` — a real DOM ancestor of
   * whatever `renderLink` returns — so it fires regardless of what that is: a
   * Fragment (React would silently drop an `onClick` added to it) or a custom
   * component that doesn't forward `onClick` to its own DOM node. */
  onItemActivate?: () => void;
}

/**
 * The navigation link list, rendered both inline in the header and inside the
 * popover menu. Only ever one of the two is in the accessibility tree at a
 * time: the inline copy is `display: none` below 1440, and Mantine's Popover
 * does not mount its children while closed.
 */
export function AppHeaderNav({
  items,
  ariaLabel,
  className,
  size = 'md',
  onItemActivate,
}: AppHeaderNavProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className={navList}>
        {items.map((item, index) => (
          <li
            key={item.href ?? index}
            className={navItem}
            // No tag/role guard: navItem is unpadded and wraps exactly one
            // item, so any click inside the <li> is a click on that item —
            // a tag-based guard would just miss non-native interactive shapes
            // (e.g. a `renderLink` returning `<div role="button">`) instead.
            onClick={onItemActivate}
          >
            <NavigationLink
              href={item.href}
              isSelected={item.isSelected}
              renderLink={item.renderLink}
              size={size}
            >
              {item.label}
            </NavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
