import type { AnchorHTMLAttributes, ReactElement, ReactNode } from 'react';
import { NavigationLink } from '../NavigationLink';
import { navList, navItem } from './AppHeader.css';

export interface AppHeaderNavigationItem {
  label: ReactNode;
  href?: string;
  isSelected?: boolean;
  renderLink?: (
    className: string,
    ariaCurrent?: AnchorHTMLAttributes<HTMLAnchorElement>['aria-current']
  ) => ReactElement;
}

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
