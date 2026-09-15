import type { AnchorHTMLAttributes, MouseEventHandler } from 'react';
import cx from 'clsx';
import { UnstyledButton } from '@mantine/core';
import { NavigationLink } from '../NavigationLink';
import { languageLink, languageLinkSelected, navItem, navList } from './AppHeader.css';

export type AppHeaderLanguage = {
  /** Matched against `currentLanguage` to determine the selected link — not `label`, which is only display text. */
  code: string;
  label: string;
} & (
  | { href: string; onClick?: undefined }
  | { href?: undefined; onClick: MouseEventHandler<HTMLButtonElement> }
);

export interface AppHeaderLanguagesProps {
  languages: AppHeaderLanguage[];
  /** A language's `code` (not `label`) to mark as selected. */
  currentLanguage?: string;
  ariaLabel: string;
  className?: string;
}

/**
 * The language switcher, rendered both inline in the header and inside the
 * popover menu. Only ever one of the two is in the accessibility tree at a
 * time when a menu exists: the inline copy is `display: none` below 1024, the
 * menu's own copy above it, and Mantine's Popover does not mount its children
 * while closed. With no menu (no `navigation`), the inline copy stays visible
 * at every width.
 */
export function AppHeaderLanguages({
  languages,
  currentLanguage,
  ariaLabel,
  className,
}: AppHeaderLanguagesProps) {
  return (
    <nav aria-label={ariaLabel} className={className}>
      <ul className={navList}>
        {languages.map((language) => {
          const isSelected = language.code === currentLanguage;
          const linkClassName = cx(languageLink, isSelected && languageLinkSelected);
          return (
            <li key={language.code} className={navItem}>
              <NavigationLink
                size="sm"
                className={linkClassName}
                isSelected={isSelected}
                // "true", not the derived "page": switching language stays
                // on the same page in another translation.
                aria-current={isSelected ? 'true' : undefined}
                {...(language.href
                  ? { href: language.href }
                  : {
                      // No `href` means there's nothing to navigate to — an
                      // `<a>` without one loses its link semantics/keyboard
                      // focusability, so this renders a real `<button>`
                      // instead (same technique as AppHeaderMenu.tsx's
                      // onClick-based actions).
                      renderLink: (
                        linkClassNameFromNavigationLink: string,
                        ariaCurrent?: AnchorHTMLAttributes<HTMLAnchorElement>['aria-current']
                      ) => (
                        <UnstyledButton
                          type="button"
                          className={linkClassNameFromNavigationLink}
                          aria-current={ariaCurrent}
                          onClick={language.onClick}
                        >
                          {language.label}
                        </UnstyledButton>
                      ),
                    })}
              >
                {language.label}
              </NavigationLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
