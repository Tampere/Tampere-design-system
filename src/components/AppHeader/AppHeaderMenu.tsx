import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type MouseEventHandler,
  type ReactNode,
} from 'react';
import cx from 'clsx';
import { Popover, UnstyledButton } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { breakpoint } from '../../theme/tokens/breakpoint';
import { MenuIcon } from '../../icons/MenuIcon';
import { CloseIcon } from '../../icons/CloseIcon';
import { LabeledIconButton } from '../LabeledIconButton';
import { Button } from '../Button';
import { NavigationLink } from '../NavigationLink';
import { iconWrapper as navigationLinkIconWrapper } from '../NavigationLink/NavigationLink.css';
import { AppHeaderNav, type AppHeaderNavigationItem } from './AppHeaderNav';
import { AppHeaderLanguages, type AppHeaderLanguage } from './AppHeaderLanguages';
import {
  menuLanguages,
  menuActions,
  menuAnchor,
  menuButton,
  menuDropdown,
  menuDropdownPositioner,
  menuNav,
  menuNavDivider,
  menuNavDividerThroughSecondaryNav,
  menuSecondaryNavVisibility,
} from './AppHeader.css';

// AppHeader's `actions` item shape: the same `href`-xor-`onClick` flexibility
// as `AppHeaderLoginProps`, but without a `renderRoot` escape hatch — unlike
// login (always a LabeledIconButton, so one renderRoot works everywhere),
// each action renders as *two different components* (LabeledIconButton
// inline, NavigationLink in the menu, see AppHeader.tsx/AppHeaderMenu.tsx),
// and a renderRoot built for one's children shape can't be reused for the
// other's. Add a second, component-specific escape hatch later if a real
// need for fully custom action markup ever comes up.
export type AppHeaderActionProps = {
  /** Visible + accessible label. */
  label: string;
  icon?: ReactNode;
  /** Applied to *both* renderings of this action — the inline
   * `LabeledIconButton` (AppHeader.tsx) and the menu's `NavigationLink`/
   * `UnstyledButton` (AppHeaderMenu.tsx) — not just whichever one happens to
   * be visible at the current width. */
  className?: string;
} & (
  | { href: string; onClick?: undefined }
  | { href?: undefined; onClick: MouseEventHandler<HTMLButtonElement> }
);

export interface AppHeaderMenuProps {
  items: AppHeaderNavigationItem[];
  navAriaLabel: string;
  menuButtonLabel: string;
  /** Label shown on the same trigger button while the menu is open — there is
   * no separate close button, so this replaces `menuButtonLabel` rather than
   * naming one. The icon always swaps to a close glyph regardless; this
   * defaults to `menuButtonLabel`'s own text ('Valikko') so only the icon
   * signals the state change — override it if the label itself should change
   * too (e.g. to 'Sulje'). */
  menuButtonLabelOpen?: string;
  languages?: AppHeaderLanguage[];
  currentLanguage?: string;
  languagesAriaLabel: string;
  /** AppHeader's `actions` slot — rendered here as `NavigationLink` +
   * `startIcon` (Figma node 14187:18169), shown only below md, where it has
   * moved out of the inline row (see AppHeader.css.ts's `menuActions`).
   * AppHeader itself renders the same items as `LabeledIconButton` inline
   * (node 14147:11664) — two different components built from one array of
   * plain data, not one shared rendered element. */
  actions?: AppHeaderActionProps[];
  /** AppHeader's multi-row-only `secondaryNavigation` slot (Figma node
   * 14151:15442's "Secondary navigation") — rendered here as its own `sm`
   * AppHeaderNav section between the primary nav and actions, shown only
   * below lg where it has moved out of the inline row (see AppHeader.css.ts's
   * `menuSecondaryNavVisibility`). */
  secondaryNavigation?: AppHeaderNavigationItem[];
  secondaryNavAriaLabel?: string;
  /** How the trigger renders — `'labeledIcon'` (default) is single-row's own
   * icon-above-caption `LabeledIconButton` (Figma node 14147:11664);
   * `'button'` is multi-row's inline primary `Button` with a trailing icon
   * (node 14151:15442's ".Main menu button" — icon+text side by side, not
   * stacked). AppHeader picks this per its own `layout` prop. */
  triggerVariant?: 'labeledIcon' | 'button';
  className?: string;
}

export function AppHeaderMenu({
  items,
  navAriaLabel,
  menuButtonLabel,
  // Mirrors menuButtonLabel by default (not a hardcoded 'Valikko') so a
  // consumer's own text is respected — only the icon signals the open state
  // unless a consumer opts into different open-state text.
  menuButtonLabelOpen = menuButtonLabel,
  languages,
  currentLanguage,
  languagesAriaLabel,
  actions,
  secondaryNavigation,
  // No default in AppHeaderBaseProps (unlike languagesAriaLabel's 'Kieli')
  // since secondaryNavigation itself has no default there either — self
  // contained here so the many existing AppHeaderMenu stories that predate
  // this prop don't all need updating.
  secondaryNavAriaLabel = 'Toissijainen navigaatio',
  triggerVariant = 'labeledIcon',
  className,
}: AppHeaderMenuProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // The inline/menu switch itself is CSS (AppHeader.css.ts). Crossing to the
  // inline-nav width hides the trigger via CSS while the menu would otherwise
  // stay open with no visible way back to a trigger. `undefined` on first
  // render is therefore harmless.
  const isInlineNav = useMediaQuery(`(min-width: ${breakpoint.xl.appWidth})`);
  // Below md, the dropdown should span the header's own full width rather
  // than a fixed 284px box — `width="target"` (passed to Popover below) asks
  // Mantine to measure menuAnchor's *actual* width instead of assuming the
  // header sits flush against the viewport (it doesn't in Storybook's own
  // preview, which wraps every story in a margin, and a consumer may wrap it
  // in a padded or max-width shell too). `undefined` on first render falls
  // through to Popover's own default ('max-content'), same harmless gap as
  // `isInlineNav` above.
  const isNarrowMenu = useMediaQuery(`(max-width: ${parseInt(breakpoint.md.appWidth) - 1}px)`);
  useEffect(() => {
    if (isInlineNav) {
      close();
    }
  }, [isInlineNav, close]);

  // Popover has no built-in focus trap/return the way Drawer did — it's
  // non-modal by design. Only steal focus back to the trigger when it's still
  // inside the panel at the moment of closing (Escape, or an outside click
  // while focus was still there); a nav link that navigates away, or a click
  // that already moved focus elsewhere, shouldn't be overridden.
  const handleClose = useCallback(() => {
    const focusStillInMenu = dropdownRef.current?.contains(document.activeElement) ?? false;
    close();
    if (focusStillInMenu) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, [close]);

  function closeMenuOnLanguageActivation(language: AppHeaderLanguage): AppHeaderLanguage {
    if (!language.onClick) return language;
    const onClick = language.onClick;
    return {
      ...language,
      onClick: (event) => {
        onClick(event);
        handleClose();
      },
    };
  }

  // Mantine's own Escape handling lives on Popover.Dropdown's root element
  // (an onKeyDownCapture there) — it only fires for a keydown whose target is
  // inside the dropdown. We deliberately don't move focus into the dropdown
  // on open (non-modal: the trigger stays focused, matching a disclosure
  // button's normal behavior), so Escape pressed right after opening would
  // never reach it. Handling it at the document level covers both cases.
  useEffect(() => {
    if (!opened) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleClose();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [opened, handleClose]);

  // Mantine's own click-outside handling (closeOnClickOutside) only ignores
  // clicks on its Popover.Target child and the dropdown — menuAnchor, not the
  // trigger button, is that child (see the Popover.Target comment below), so
  // a click on the trigger itself would count as "outside": Mantine closes
  // it via onChange, and the trigger — now re-rendered with onClick bound to
  // `open` since it's closed — reopens itself on the very same click.
  // Handling it manually here lets the trigger count as "inside" too.
  useEffect(() => {
    if (!opened) return;
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (dropdownRef.current?.contains(target)) return;
      if (triggerRef.current?.contains(target)) return;
      handleClose();
    }
    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
    };
  }, [opened, handleClose]);

  return (
    <Popover
      opened={opened}
      // Popover is fully controlled (`opened`), so Mantine's own Escape
      // handling only reaches us through `onChange` — same wiring as
      // DateField.tsx's calendar popover. Click-outside is handled manually
      // above instead (closeOnClickOutside={false} below).
      onChange={(next) => {
        if (!next) handleClose();
      }}
      closeOnClickOutside={false}
      // Keeps the panel next to its trigger in DOM order — Mantine's default
      // portals it to the end of <body>, which puts the whole page between the
      // trigger and the nav it opens (WCAG 2.4.3). Nothing clips it: no
      // ancestor sets `overflow`, and menuAnchor is absolute inside `root`.
      withinPortal={false}
      position="bottom-end"
      offset={0}
      // floating-ui's `shift` middleware (on by default) keeps a 5px buffer
      // from its clipping boundary even when the anchor is already exactly
      // where it should be — menuAnchor is deliberately engineered to match
      // the header's own edges exactly, so that buffer only pushes the
      // dropdown 5px away from where it's supposed to sit. Zeroing it here
      // is more precise than clamping position with a viewport-relative
      // override afterwards (the previous approach), since it fixes the
      // cause instead of the symptom.
      middlewares={{ shift: { padding: 0 } }}
      // Below md, the dropdown measures menuAnchor's real width instead of a
      // fixed 284px box (see isNarrowMenu above and menuAnchor's own comment
      // in AppHeader.css.ts) — Mantine's `size` middleware sets this via an
      // inline style when width="target".
      width={isNarrowMenu ? 'target' : 'max-content'}
      // menuAnchor has zero *height* (still true even though its width is
      // now 100%), which breaks floating-ui's `hide()` middleware the same
      // way a fully zero-size reference would: its "fully clipped" check
      // (offset = overflow - rect size) degenerates to `overflow >= 0` when
      // either dimension is 0, so a reference sitting exactly flush against
      // a clipping boundary (as ours does, pinned to the header's own edge)
      // can read as clipped even though it's visually fine. hideDetached is
      // what consumes that signal to force the dropdown to display:none —
      // irrelevant for an anchor that never scrolls independently of the
      // header anyway.
      hideDetached={false}
      // Mantine would otherwise add role="dialog" to the dropdown and
      // aria-haspopup/expanded/controls to the target below. We own those
      // roles instead, on the trigger button itself — this is a non-modal
      // disclosure panel, not a dialog.
      withRoles={false}
    >
      {/* Popover.Target only supplies the floating-ui reference here — an
          invisible sentinel pinned to the header's own bottom-right corner
          (see menuAnchor), not the trigger button. Popover is controlled and
          withRoles={false}, so PopoverTarget injects no onClick/ARIA either
          way (see Mantine's PopoverTarget source) — nothing is lost by the
          real trigger living outside it as a normal sibling below. */}
      <Popover.Target>
        <span className={menuAnchor} aria-hidden="true" />
      </Popover.Target>
      {triggerVariant === 'button' ? (
        <Button
          ref={triggerRef}
          variant="primary"
          className={cx(menuButton, className)}
          rightIcon={opened ? <CloseIcon /> : <MenuIcon />}
          onClick={opened ? handleClose : open}
          aria-expanded={opened}
          aria-controls={menuId}
        >
          {opened ? menuButtonLabelOpen : menuButtonLabel}
        </Button>
      ) : (
        <LabeledIconButton
          ref={triggerRef}
          className={cx(menuButton, className)}
          icon={opened ? <CloseIcon /> : <MenuIcon />}
          label={opened ? menuButtonLabelOpen : menuButtonLabel}
          onClick={opened ? handleClose : open}
          aria-expanded={opened}
          aria-controls={menuId}
        />
      )}
      {/* Compositional form, not <Popover.Dropdown id={menuId}>: the visible
          panel — id, ref, and the menuDropdown width/background/shadow — is a
          plain div we fully control, rather than depending on ref-forwarding
          and style merging from Popover.Dropdown itself, which is otherwise
          just an unstyled positioning shell. */}
      <Popover.Dropdown className={menuDropdownPositioner}>
        <div id={menuId} ref={dropdownRef} className={menuDropdown}>
          <AppHeaderNav
            items={items}
            ariaLabel={navAriaLabel}
            onItemActivate={handleClose}
            className={cx(
              menuNav,
              secondaryNavigation?.length
                ? menuNavDividerThroughSecondaryNav
                : actions?.length
                  ? menuNavDivider
                  : null
            )}
          />
          {secondaryNavigation?.length ? (
            <AppHeaderNav
              items={secondaryNavigation}
              ariaLabel={secondaryNavAriaLabel}
              onItemActivate={handleClose}
              size="sm"
              className={cx(
                menuNav,
                menuSecondaryNavVisibility,
                actions?.length ? menuNavDivider : null
              )}
            />
          ) : null}
          {actions?.length ? (
            <div className={menuActions}>
              {actions.map((action, index) =>
                action.href ? (
                  <NavigationLink
                    key={index}
                    href={action.href}
                    startIcon={action.icon}
                    className={action.className}
                  >
                    {action.label}
                  </NavigationLink>
                ) : (
                  <NavigationLink
                    key={index}
                    startIcon={action.icon}
                    renderLink={(linkClassName) => (
                      <UnstyledButton
                        className={cx(linkClassName, action.className)}
                        onClick={(event) => {
                          action.onClick?.(event);
                          handleClose();
                        }}
                      >
                        {action.icon ? (
                          <span className={navigationLinkIconWrapper}>{action.icon}</span>
                        ) : null}
                        {action.label}
                      </UnstyledButton>
                    )}
                  />
                )
              )}
            </div>
          ) : null}
          {languages?.length ? (
            <AppHeaderLanguages
              languages={languages.map(closeMenuOnLanguageActivation)}
              currentLanguage={currentLanguage}
              ariaLabel={languagesAriaLabel}
              className={menuLanguages}
            />
          ) : null}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
