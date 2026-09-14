import type { MouseEventHandler, ReactNode } from 'react';
import cx from 'clsx';
import { TampereLogo } from '../../logos/TampereLogo';
import { LabeledIconButton, type LabeledIconButtonProps } from '../LabeledIconButton';
import { LoginIcon } from '../../icons/LoginIcon';
import { AppHeaderNav, type AppHeaderNavigationItem } from './AppHeaderNav';
import { AppHeaderMenu } from './AppHeaderMenu';
import { AppHeaderBrand } from './AppHeaderBrand';
import { AppHeaderLanguages, type AppHeaderLanguage } from './AppHeaderLanguages';
import {
  root,
  row,
  singleRowRow,
  singleRowLeftSection,
  singleRowRightSection,
  rightSection,
  secondaryLogo,
  searchContainer,
  inlineNav,
  inlineLanguages,
  inlineActions,
  siteName as siteNameClass,
  siteNameSubheader,
} from './AppHeader.css';

// Re-exported so `index.ts` (and the package barrel) keep exporting it from here.
export type { AppHeaderLanguage };

export type AppHeaderLoginProps = {
  /** Visible + accessible label — e.g. "Kirjaudu" logged out, the user's name
   * once authenticated. No default: the right value depends on auth state,
   * which AppHeader doesn't model itself. */
  label: string;
  /** Defaults to `<LoginIcon />`; override with e.g. `<UserIcon />` once authenticated. */
  icon?: ReactNode;
  className?: string;
} & (
  | { onClick: MouseEventHandler<HTMLButtonElement>; renderRoot?: undefined }
  | { onClick?: undefined; renderRoot: NonNullable<LabeledIconButtonProps['renderRoot']> }
);

export interface AppHeaderBaseProps {
  siteName?: ReactNode;
  /** Default `'/'` — the brand logo always links somewhere, so an app mounted under a sub-path should pass its own. */
  homeHref?: string;
  /** Omit entirely (rather than passing `[]`) to render a header with no navigation at all — both the inline nav and the menu trigger are hidden when empty. */
  navigation?: AppHeaderNavigationItem[];
  /** Required: names the `navigation` landmark for AT, since a header can contain more than one `<nav>` (this one, plus the language switcher). No sensible Finnish default exists — it depends on the consumer's own navigation structure. */
  navAriaLabel: string;
  /** With `navigation`, the links move into the popover menu below 1024px; without it, they stay inline at every width since there is no menu to carry them. */
  languages?: AppHeaderLanguage[];
  /** A language's `code` (not `label`) to mark as selected. */
  currentLanguage?: string;
  languagesAriaLabel?: string;
  /** Slot rendered after the language links, before `login`. */
  actions?: ReactNode;
  /** Dedicated login control, rendered as a `LabeledIconButton` between
   * `actions` and the menu button/secondary logo (Figma node 14147:11664's
   * `Login container`). Reuse the same slot for the authenticated look by
   * swapping `icon`/`label` (e.g. `<UserIcon />` + the user's name) — Figma
   * has no separate design for that; it's the same control with different
   * content (node 14166:4271). Unlike `actions`/`languages`, this always
   * stays inline — it never collapses into the popover menu. */
  login?: AppHeaderLoginProps;
  menuButtonLabel?: string;
  /** Label (and icon) the menu trigger shows while the menu is open. Default `'Sulje'`. */
  menuButtonLabelOpen?: string;
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

/**
 * The site chrome header: brand logo, optional site name, primary navigation,
 * language switcher, and `actions`/`search` slots. `layout` selects Figma's
 * two variants — `'single-row'` (the default) puts everything in one row;
 * `'multi-row'` adds a second row carrying the `search` slot below the brand
 * row (single-row has no `search` slot — put a search trigger in `actions`
 * instead).
 *
 * Both layouts share the same responsive collapse: the primary navigation
 * renders inline from 1440px up (`breakpoint.xl`) and drops into a popover
 * menu below it, and the language links move into that menu below 1024px
 * (`breakpoint.lg`) whenever a menu exists — see the `languages` prop.
 */
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
  login,
  menuButtonLabel = 'Valikko',
  menuButtonLabelOpen,
  className,
}: AppHeaderProps) {
  const hasMenu = navigation.length > 0;

  // Split so single-row can place the inline nav and the menu trigger on
  // opposite ends of its right section (Fix 1) while multi-row keeps them
  // adjacent, as `nav` did before. The two never coexist visibly — inline
  // nav shows ≥1440, the trigger below it — so splitting changes nothing at
  // any single width.
  const inlineNavEl = hasMenu ? (
    <AppHeaderNav items={navigation} ariaLabel={navAriaLabel} className={inlineNav} />
  ) : null;

  const menuEl = hasMenu ? (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel={navAriaLabel}
      menuButtonLabel={menuButtonLabel}
      menuButtonLabelOpen={menuButtonLabelOpen}
      languages={languages}
      currentLanguage={currentLanguage}
      languagesAriaLabel={languagesAriaLabel}
      actions={actions}
    />
  ) : null;

  // Wrapped (and hidden below md) only when a menu exists to carry it — with
  // no navigation there is no menu, and hiding `actions` would strand it
  // entirely, same reasoning as `inlineLanguageNav` below.
  const inlineActionsEl = hasMenu ? <div className={inlineActions}>{actions}</div> : actions;

  const loginEl = login ? (
    <LabeledIconButton
      className={login.className}
      icon={login.icon ?? <LoginIcon />}
      label={login.label}
      onClick={login.onClick}
      renderRoot={login.renderRoot}
    />
  ) : null;

  const inlineLanguageNav = languages?.length ? (
    <AppHeaderLanguages
      languages={languages}
      currentLanguage={currentLanguage}
      ariaLabel={languagesAriaLabel}
      // Hidden below 1024 only when the menu exists to carry them — with no
      // navigation there is no menu, and hiding them would strand the
      // language switcher entirely.
      className={hasMenu ? inlineLanguages : undefined}
    />
  ) : null;

  if (layout === 'multi-row') {
    return (
      <header className={cx(root, className)}>
        <div className={row}>
          <AppHeaderBrand
            siteName={siteName}
            homeHref={homeHref}
            siteNameClassName={siteNameClass}
          />
          <div className={rightSection}>
            {inlineLanguageNav}
            {inlineActionsEl}
            {loginEl}
            <TampereLogo className={secondaryLogo} />
          </div>
        </div>
        {search || hasMenu ? (
          <div className={row}>
            <div className={searchContainer}>{search}</div>
            <div className={rightSection}>
              {inlineNavEl}
              {menuEl}
            </div>
          </div>
        ) : null}
      </header>
    );
  }

  // Single row: brand on the left; the right section runs inline navigation,
  // then languages, then the actions slot, then login, then the menu
  // trigger last — matching Figma node 14147:11664's right-section child
  // order. No secondary logo — Figma hides it at every single-row breakpoint.
  return (
    <header className={cx(root, className)}>
      <div className={singleRowRow}>
        <AppHeaderBrand
          siteName={siteName}
          homeHref={homeHref}
          siteNameClassName={siteNameSubheader}
          className={singleRowLeftSection}
        />
        <div className={singleRowRightSection}>
          {inlineNavEl}
          {inlineLanguageNav}
          {inlineActionsEl}
          {loginEl}
          {menuEl}
        </div>
      </div>
    </header>
  );
}
