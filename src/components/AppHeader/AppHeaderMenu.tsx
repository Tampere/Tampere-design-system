import { useCallback, useEffect, useId, useRef, type ReactNode } from 'react';
import cx from 'clsx';
import { Popover } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { breakpoint } from '../../theme/tokens/breakpoint';
import { MenuIcon } from '../../icons/MenuIcon';
import { CloseIcon } from '../../icons/CloseIcon';
import { LabeledIconButton } from '../LabeledIconButton';
import { AppHeaderNav, type AppHeaderNavigationItem } from './AppHeaderNav';
import { AppHeaderLanguages, type AppHeaderLanguage } from './AppHeaderLanguages';
import {
  menuLanguages,
  menuActions,
  menuButton,
  menuDropdown,
  menuDropdownPositioner,
} from './AppHeader.css';

export interface AppHeaderMenuProps {
  items: AppHeaderNavigationItem[];
  navAriaLabel: string;
  menuButtonLabel: string;
  /** Label shown on the same trigger button while the menu is open (icon also
   * swaps to a close glyph) — there is no separate close button, so this
   * replaces `menuButtonLabel` rather than naming one. Default `'Sulje'`. */
  menuButtonLabelOpen?: string;
  languages?: AppHeaderLanguage[];
  currentLanguage?: string;
  languagesAriaLabel: string;
  /** AppHeader's `actions` slot, mirrored here — shown only below md, where
   * it has moved out of the inline row (see AppHeader.css.ts's `menuActions`). */
  actions?: ReactNode;
  className?: string;
}

export function AppHeaderMenu({
  items,
  navAriaLabel,
  menuButtonLabel,
  menuButtonLabelOpen = 'Sulje',
  languages,
  currentLanguage,
  languagesAriaLabel,
  actions,
  className,
}: AppHeaderMenuProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const menuId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // The only JS breakpoint logic in this component, and it drives no rendering
  // — the inline/menu switch itself is CSS (AppHeader.css.ts). Crossing to the
  // inline-nav width hides the trigger via CSS while the menu would otherwise
  // stay open with no visible way back to a trigger. `undefined` on first
  // render is therefore harmless.
  const isInlineNav = useMediaQuery(`(min-width: ${breakpoint.xl.appWidth})`);
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

  return (
    <Popover
      opened={opened}
      // Popover is fully controlled (`opened`), so Mantine's own Escape/
      // outside-click handling only reaches us through `onChange` — same
      // wiring as DateField.tsx's calendar popover.
      onChange={(next) => {
        if (!next) handleClose();
      }}
      position="bottom-end"
      offset={0}
      // Mantine would otherwise add role="dialog" to the dropdown and
      // aria-haspopup/expanded/controls to the target below. We own those
      // roles instead, on the trigger button itself — this is a non-modal
      // disclosure panel, not a dialog.
      withRoles={false}
    >
      {/* Popover is fully controlled (`opened` is a boolean), so PopoverTarget
          never injects its own onClick toggle — only an uncontrolled Popover
          does that (see Mantine's PopoverTarget source). Safe to put the real
          trigger directly here with its own onClick. */}
      <Popover.Target>
        <LabeledIconButton
          ref={triggerRef}
          className={cx(menuButton, className)}
          icon={opened ? <CloseIcon /> : <MenuIcon />}
          label={opened ? menuButtonLabelOpen : menuButtonLabel}
          onClick={opened ? handleClose : open}
          aria-expanded={opened}
          aria-controls={menuId}
        />
      </Popover.Target>
      {/* Compositional form, not <Popover.Dropdown id={menuId}>: the visible
          panel — id, ref, and the menuDropdown width/background/shadow — is a
          plain div we fully control, rather than depending on ref-forwarding
          and style merging from Popover.Dropdown itself, which is otherwise
          just an unstyled positioning shell. */}
      <Popover.Dropdown className={menuDropdownPositioner}>
        <div id={menuId} ref={dropdownRef} className={menuDropdown}>
          <AppHeaderNav items={items} ariaLabel={navAriaLabel} />
          {languages?.length ? (
            <AppHeaderLanguages
              languages={languages}
              currentLanguage={currentLanguage}
              ariaLabel={languagesAriaLabel}
              className={menuLanguages}
            />
          ) : null}
          {actions ? <div className={menuActions}>{actions}</div> : null}
        </div>
      </Popover.Dropdown>
    </Popover>
  );
}
