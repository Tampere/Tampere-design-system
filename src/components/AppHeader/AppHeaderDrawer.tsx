import { useEffect, useId } from 'react';
import cx from 'clsx';
import { Drawer } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { breakpoint } from '../../theme/tokens/breakpoint';
import { MenuIcon } from '../../icons/MenuIcon';
import { Button } from '../Button/Button';
import { AppHeaderNav, type AppHeaderNavigationItem } from './AppHeaderNav';
import { menuButton } from './AppHeader.css';

export interface AppHeaderDrawerProps {
  items: AppHeaderNavigationItem[];
  navAriaLabel: string;
  menuButtonLabel: string;
  drawerTitle: string;
  className?: string;
}

export function AppHeaderDrawer({
  items,
  navAriaLabel,
  menuButtonLabel,
  drawerTitle,
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
      <Button
        className={cx(menuButton, className)}
        rightIcon={<MenuIcon />}
        onClick={open}
        aria-expanded={opened}
        aria-controls={drawerId}
      >
        {menuButtonLabel}
      </Button>
      {/* Compositional form, not <Drawer id={drawerId}>: Mantine doesn't put that id on
          the element that becomes the dialog, leaving aria-controls dangling. */}
      <Drawer.Root opened={opened} onClose={close} position="right">
        <Drawer.Overlay />
        <Drawer.Content id={drawerId}>
          <Drawer.Header>
            <Drawer.Title>{drawerTitle}</Drawer.Title>
            <Drawer.CloseButton />
          </Drawer.Header>
          <Drawer.Body>
            <AppHeaderNav items={items} ariaLabel={navAriaLabel} />
          </Drawer.Body>
        </Drawer.Content>
      </Drawer.Root>
    </>
  );
}
