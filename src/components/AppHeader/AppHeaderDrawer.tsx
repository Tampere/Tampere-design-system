import { useEffect, useId } from 'react';
import cx from 'clsx';
import { Drawer } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { breakpoint } from '../../theme/tokens/breakpoint';
import { MenuIcon } from '../../icons/MenuIcon';
import { LabeledIconButton } from '../LabeledIconButton';
import { AppHeaderNav, type AppHeaderNavigationItem } from './AppHeaderNav';
import { AppHeaderLanguages, type AppHeaderLanguage } from './AppHeaderLanguages';
import { drawerLanguages, menuButton } from './AppHeader.css';

export interface AppHeaderDrawerProps {
  items: AppHeaderNavigationItem[];
  navAriaLabel: string;
  menuButtonLabel: string;
  drawerTitle: string;
  closeButtonLabel?: string;
  languages?: AppHeaderLanguage[];
  currentLanguage?: string;
  languagesAriaLabel: string;
  className?: string;
}

export function AppHeaderDrawer({
  items,
  navAriaLabel,
  menuButtonLabel,
  drawerTitle,
  closeButtonLabel = 'Sulje valikko',
  languages,
  currentLanguage,
  languagesAriaLabel,
  className,
}: AppHeaderDrawerProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const drawerId = useId();

  // The only JS breakpoint logic in this component, and it drives no rendering
  // — the inline/drawer switch itself is CSS (AppHeader.css.ts). Crossing to
  // the inline-nav width hides the trigger via CSS while the drawer would
  // otherwise stay open, stranding its focus trap with no way back to a
  // visible control. `undefined` on first render is therefore harmless.
  const isInlineNav = useMediaQuery(`(min-width: ${breakpoint.xl.appWidth})`);
  useEffect(() => {
    if (isInlineNav) {
      close();
    }
  }, [isInlineNav, close]);

  return (
    <>
      <LabeledIconButton
        className={cx(menuButton, className)}
        icon={<MenuIcon />}
        label={menuButtonLabel}
        onClick={open}
        aria-expanded={opened}
        aria-controls={drawerId}
      />
      {/* Compositional form, not <Drawer id={drawerId}>: Mantine doesn't put that id on
          the element that becomes the dialog, leaving aria-controls dangling. */}
      <Drawer.Root opened={opened} onClose={close} position="right">
        <Drawer.Overlay />
        <Drawer.Content id={drawerId}>
          <Drawer.Header>
            <Drawer.Title>{drawerTitle}</Drawer.Title>
            {/* Mantine supplies no default aria-label here (see #94, where Modal shipped the same gap). */}
            <Drawer.CloseButton aria-label={closeButtonLabel} />
          </Drawer.Header>
          <Drawer.Body>
            <AppHeaderNav items={items} ariaLabel={navAriaLabel} />
            {languages?.length ? (
              <AppHeaderLanguages
                languages={languages}
                currentLanguage={currentLanguage}
                ariaLabel={languagesAriaLabel}
                className={drawerLanguages}
              />
            ) : null}
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
