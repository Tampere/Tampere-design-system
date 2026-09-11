import type { ReactNode } from 'react';
import cx from 'clsx';
import { TampereLogo } from '../../logos/TampereLogo';
import { AppHeaderNav, type AppHeaderNavigationItem } from './AppHeaderNav';
import { AppHeaderDrawer } from './AppHeaderDrawer';
import { AppHeaderBrand } from './AppHeaderBrand';
import { AppHeaderLanguages, type AppHeaderLanguage } from './AppHeaderLanguages';
import {
  root,
  row,
  rightSection,
  secondaryLogo,
  searchContainer,
  inlineNav,
  inlineLanguages,
} from './AppHeader.css';

// Re-exported so `index.ts` (and the package barrel) keep exporting it from here.
export type { AppHeaderLanguage };

export interface AppHeaderBaseProps {
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
  /** Slot rendered after the language links, e.g. a login button. */
  actions?: ReactNode;
  menuButtonLabel?: string;
  drawerTitle?: string;
  /** Accessible name for the drawer's close button. Default `'Sulje valikko'`. */
  closeButtonLabel?: string;
  className?: string;
}

export type AppHeaderProps =
  | (AppHeaderBaseProps & {
      /** Default. One row: brand, navigation, languages and `actions` side by side. Figma's Single-row variant. */
      layout?: 'single-row';
      /** Single-row has no search slot — put a search trigger in `actions` instead. */
      search?: never;
    })
  | (AppHeaderBaseProps & {
      /** Two rows, with a dedicated search slot below the brand row. Figma's Multi-row variant. */
      layout: 'multi-row';
      /** Search input slot, rendered as-is — AppHeader supplies layout only. */
      search?: ReactNode;
    });

/** The site chrome header: brand logo, optional site name, primary navigation (inline at xl/xxl, a drawer below), language switcher, and search/actions slots. */
export function AppHeader({
  siteName,
  homeHref = '/',
  navigation = [],
  navAriaLabel,
  languages,
  currentLanguage,
  languagesAriaLabel = 'Kieli',
  layout,
  search,
  actions,
  menuButtonLabel = 'Valikko',
  drawerTitle = 'Valikko',
  closeButtonLabel,
  className,
}: AppHeaderProps) {
  const hasDrawer = navigation.length > 0;

  const nav = hasDrawer ? (
    <>
      <AppHeaderNav items={navigation} ariaLabel={navAriaLabel} className={inlineNav} />
      <AppHeaderDrawer
        items={navigation}
        navAriaLabel={navAriaLabel}
        menuButtonLabel={menuButtonLabel}
        drawerTitle={drawerTitle}
        closeButtonLabel={closeButtonLabel}
        languages={languages}
        currentLanguage={currentLanguage}
        languagesAriaLabel={languagesAriaLabel}
      />
    </>
  ) : null;

  const inlineLanguageNav = languages?.length ? (
    <AppHeaderLanguages
      languages={languages}
      currentLanguage={currentLanguage}
      ariaLabel={languagesAriaLabel}
      // Hidden below 1024 only when the drawer exists to carry them — with no
      // navigation there is no drawer, and hiding them would strand the
      // language switcher entirely.
      className={hasDrawer ? inlineLanguages : undefined}
    />
  ) : null;

  if (layout === 'multi-row') {
    return (
      <header className={cx(root, className)}>
        <div className={row}>
          <AppHeaderBrand siteName={siteName} homeHref={homeHref} />
          <div className={rightSection}>
            {inlineLanguageNav}
            {actions}
            <TampereLogo className={secondaryLogo} />
          </div>
        </div>
        <div className={row}>
          <div className={searchContainer}>{search}</div>
          <div className={rightSection}>{nav}</div>
        </div>
      </header>
    );
  }

  // Single-row right section follows Figma's own order: navigation, language
  // menu, slot, then the menu button. No secondary logo — Figma hides it at
  // every single-row breakpoint.
  return (
    <header className={cx(root, className)}>
      <div className={row}>
        <AppHeaderBrand siteName={siteName} homeHref={homeHref} />
        <div className={rightSection}>
          {inlineLanguageNav}
          {actions}
          {nav}
        </div>
      </div>
    </header>
  );
}
