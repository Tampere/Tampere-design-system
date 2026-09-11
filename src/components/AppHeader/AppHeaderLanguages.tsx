import { NavigationLink } from '../NavigationLink';
import { languageLink, navItem, navList } from './AppHeader.css';

export interface AppHeaderLanguage {
  /** Matched against `currentLanguage` to determine the selected link — not `label`, which is only display text. */
  code: string;
  label: string;
  href: string;
}

export interface AppHeaderLanguagesProps {
  languages: AppHeaderLanguage[];
  /** A language's `code` (not `label`) to mark as selected. */
  currentLanguage?: string;
  ariaLabel: string;
  className?: string;
}

/**
 * The language switcher, rendered both inline in the header and inside the
 * drawer. Only ever one of the two is in the accessibility tree at a time: the
 * inline copy is `display: none` below 1024, the drawer copy above it, and
 * Mantine's Drawer does not mount its children while closed.
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
        {languages.map((language) => (
          <li key={language.code} className={navItem}>
            <NavigationLink
              href={language.href}
              size="sm"
              className={languageLink}
              isSelected={language.code === currentLanguage}
              // "true", not the derived "page": switching language
              // stays on the same page in another translation.
              aria-current={language.code === currentLanguage ? 'true' : undefined}
            >
              {language.label}
            </NavigationLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
