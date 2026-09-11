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
} from './AppHeader.css';

export interface AppHeaderLanguage {
  code: string;
  label: string;
  href: string;
}

export interface AppHeaderProps {
  siteName?: ReactNode;
  homeHref?: string;
  navigation?: AppHeaderNavigationItem[];
  navAriaLabel: string;
  languages?: AppHeaderLanguage[];
  currentLanguage?: string;
  languagesAriaLabel?: string;
  search?: ReactNode;
  actions?: ReactNode;
  menuButtonLabel?: string;
  drawerTitle?: string;
  closeButtonLabel?: string;
  className?: string;
}

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
          <AppHeaderNav items={navigation} ariaLabel={navAriaLabel} className={inlineNav} />
          <AppHeaderDrawer
            items={navigation}
            navAriaLabel={navAriaLabel}
            menuButtonLabel={menuButtonLabel}
            drawerTitle={drawerTitle}
            closeButtonLabel={closeButtonLabel}
          />
        </div>
      </div>
    </header>
  );
}
