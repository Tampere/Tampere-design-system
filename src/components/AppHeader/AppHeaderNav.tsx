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
}

/**
 * The navigation link list, rendered both inline in the header and inside the
 * drawer. Only ever one of the two is in the accessibility tree at a time: the
 * inline copy is `display: none` below 1440, and Mantine's Drawer does not
 * mount its children while closed.
 */
export function AppHeaderNav({ items, ariaLabel, className }: AppHeaderNavProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className={navList}>
        {items.map((item, index) => (
          <li key={item.href ?? index} className={navItem}>
            <NavigationLink
              href={item.href}
              isSelected={item.isSelected}
              renderLink={item.renderLink}
            >
              {item.label}
            </NavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
