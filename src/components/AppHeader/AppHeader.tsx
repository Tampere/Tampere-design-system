import type { ReactNode } from 'react';
import cx from 'clsx';
import { TampereVaakuna } from '../../logos/TampereVaakuna';
import { TampereLogo } from '../../logos/TampereLogo';
import { NavigationLink } from '../NavigationLink';
import { AppHeaderNav, type AppHeaderNavigationItem } from './AppHeaderNav';
import { AppHeaderDrawer } from './AppHeaderDrawer';
import {
  root,
  row,
  leftSection,
  rightSection,
  brandLink,
  primaryLogo,
  secondaryLogo,
  siteName as siteNameClass,
  searchContainer,
  inlineNav,
  navList,
  navItem,
  languageLink,
} from './AppHeader.css';

export interface AppHeaderLanguage {
  /** Matched against `currentLanguage` to determine the selected link — not `label`, which is only display text. */
  code: string;
  label: string;
  href: string;
}

export interface AppHeaderProps {
  siteName?: ReactNode;
  /** Default `'/'` — the brand logo always links somewhere, so an app mounted under a sub-path should pass its own. */
  homeHref?: string;
  /** Omit entirely (rather than passing `[]`) to render a header with no navigation at all — both the inline nav and the drawer trigger are hidden when empty. */
  navigation?: AppHeaderNavigationItem[];
  /** Required: names the `navigation` landmark for AT, since a header can contain more than one `<nav>` (this one, plus the language switcher). No sensible Finnish default exists — it depends on the consumer's own navigation structure. */
  navAriaLabel: string;
  languages?: AppHeaderLanguage[];
  /** A language's `code` (not `label`) to mark as selected. */
  currentLanguage?: string;
  languagesAriaLabel?: string;
  /** Search input slot, rendered as-is — AppHeader supplies layout only. */
  search?: ReactNode;
  /** Slot rendered after the language links, e.g. a login button. */
  actions?: ReactNode;
  menuButtonLabel?: string;
  drawerTitle?: string;
  /** Accessible name for the drawer's close button. Default `'Sulje valikko'`. */
  closeButtonLabel?: string;
  className?: string;
}

/** The site chrome header: brand logo, optional site name, primary navigation (inline at xl/xxl, a drawer below), language switcher, and search/actions slots. */
export function AppHeader({
  siteName,
  homeHref = '/',
  navigation = [],
  navAriaLabel,
  languages,
  currentLanguage,
  languagesAriaLabel = 'Kieli',
  search,
  actions,
  menuButtonLabel = 'Valikko',
  drawerTitle = 'Valikko',
  closeButtonLabel,
  className,
}: AppHeaderProps) {
  return (
    <header className={cx(root, className)}>
      <div className={row}>
        <div className={leftSection}>
          {/* The link wraps the logo only: an accessible name concatenating
              "Tampere" with an arbitrary site name reads poorly and changes
              per consumer. */}
          <a href={homeHref} className={brandLink} aria-label="Tampere">
            <TampereVaakuna className={primaryLogo} />
          </a>
          {siteName ? <span className={siteNameClass}>{siteName}</span> : null}
        </div>
        <div className={rightSection}>
          {languages?.length ? (
            <nav aria-label={languagesAriaLabel}>
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
          ) : null}
          {actions}
          <TampereLogo className={secondaryLogo} />
        </div>
      </div>
      <div className={row}>
        <div className={searchContainer}>{search}</div>
        <div className={rightSection}>
          {navigation.length > 0 ? (
            <>
              <AppHeaderNav items={navigation} ariaLabel={navAriaLabel} className={inlineNav} />
              <AppHeaderDrawer
                items={navigation}
                navAriaLabel={navAriaLabel}
                menuButtonLabel={menuButtonLabel}
                drawerTitle={drawerTitle}
                closeButtonLabel={closeButtonLabel}
              />
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
