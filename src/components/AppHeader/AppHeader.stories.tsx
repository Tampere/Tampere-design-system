import { useState, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { UnstyledButton } from '@mantine/core';
import { AppHeaderNav, type AppHeaderNavigationItem } from './AppHeaderNav';
import { AppHeaderMenu } from './AppHeaderMenu';
import { AppHeader } from './AppHeader';
import type { AppHeaderActionProps } from '../index';
import { Paper } from '../Paper';
import { SearchField } from '../SearchField';
import { SearchIcon } from '../../icons/SearchIcon';
import { UserIcon } from '../../icons/UserIcon';
import { CartIcon } from '../../icons/CartIcon';
import { iconWrapper as navigationLinkIconWrapper } from '../NavigationLink/NavigationLink.css';

const navigation = [
  { label: 'Palvelut', href: '/palvelut' },
  { label: 'Asiointi', href: '/asiointi', isSelected: true },
  { label: 'Yhteystiedot', href: '/yhteystiedot' },
];

const languages = [
  { code: 'fi', label: 'FI', href: '/fi' },
  { code: 'en', label: 'EN', href: '/en' },
];

// Figma node 14151:15442's multi-row "Secondary navigation" example items.
const secondaryNavigation = [
  { label: 'Matkailijalle', href: '/matkailijalle' },
  { label: 'Osallistuminen', href: '/osallistuminen' },
];

// AppHeader's `search` slot is a generic ReactNode — this is the design
// system's own recommended usage, the SearchField component itself, static
// data rather than SearchField.stories.tsx's own live-GitHub-API example
// (see the #149 flake it hits under full-suite load). No `inputLabel`: its
// only visible affordance in Figma's header (node 14151:15442) is the
// placeholder, and TextField renders no <label> element unless `inputLabel`
// is set (Mantine's InputWrapper), so `aria-label` alone gives the
// accessible name without an unwanted visible label.
function AppHeaderSearchField() {
  return (
    <SearchField
      aria-label="Etsi"
      placeholder="Etsi"
      fillAvailableSpace
      data={[
        { value: 'palvelut', label: 'Palvelut' },
        { value: 'yhteystiedot', label: 'Yhteystiedot' },
      ]}
      onSearch={() => {}}
      clearButtonLabel="Tyhjennä"
      // Distinct from the input's own "Etsi" aria-label above — SearchField
      // renders both as separately-labelled controls, and getByLabelText
      // assertions below rely on "Etsi" resolving to exactly the input.
      searchButtonLabel="Hae"
    />
  );
}

// Clicks the menu trigger and waits out Mantine's Popover mount transition —
// the dropdown's content renders a tick after `opened` flips (same gotcha as
// Modal.stories.tsx). Returns the dropdown by id (via the trigger's
// aria-controls) rather than by role, since a non-modal Popover carries no
// role="dialog" the way Drawer did.
async function openMenuAndGetDropdown(trigger: HTMLElement) {
  await userEvent.click(trigger);
  const controls = trigger.getAttribute('aria-controls') as string;
  let dropdown: HTMLElement | null = null;
  await waitFor(() => {
    dropdown = document.getElementById(controls);
    expect(dropdown).not.toBeNull();
  });
  return dropdown as unknown as HTMLElement;
}

const meta = {
  component: AppHeader,
  tags: ['!dev', '!autodocs'],
} satisfies Meta<typeof AppHeader>;

export default meta;

const docExample = ['dev', 'autodocs'];

export const NavRendersLabelledLandmark: StoryObj<typeof AppHeaderNav> = {
  // render (not args): meta.component is now AppHeader, so args-based
  // auto-render would mount AppHeader with AppHeaderNav's props instead.
  render: () => <AppHeaderNav items={navigation} ariaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const nav = canvas.getByRole('navigation', { name: 'Päänavigaatio' });
    await expect(nav).not.toBeNull();

    // A list, so AT announces "3 items" rather than three loose links.
    await expect(within(nav).getAllByRole('listitem').length).toBe(3);

    await expect(canvas.getByRole('link', { name: 'Asiointi' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    await expect(canvas.getByRole('link', { name: 'Palvelut' })).not.toHaveAttribute(
      'aria-current'
    );
  },
};

export const PopoverOpensAndWiresAria: StoryObj<typeof AppHeaderMenu> = {
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const controls = trigger.getAttribute('aria-controls');
    await expect(controls).not.toBeNull();

    // aria-controls must resolve to a real element once the panel exists,
    // otherwise the relationship is a dangling reference — openMenuAndGetDropdown
    // waits out Mantine's Popover mount transition before returning it.
    const dropdown = await openMenuAndGetDropdown(trigger);

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // Resolved by id off aria-controls rather than through the canvas, so the
    // assertion doesn't depend on where the panel sits in the DOM.
    await expect(
      within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' })
    ).not.toBeNull();
  },
};

export const MenuButtonIsALabeledIconButton: StoryObj<typeof AppHeaderMenu> = {
  // triggerVariant defaults to 'labeledIcon' — single-row's own trigger
  // style (Figma node 14147:11664's ".Main menu button"). See
  // MenuButtonIsAButtonInMultiRow below for the multi-row-only alternative.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    // LabeledIconButton stacks its icon above the label, unlike the
    // horizontal Button triggerVariant="button" renders instead.
    await expect(getComputedStyle(trigger).flexDirection).toBe('column');

    // It omits and strips aria-label/aria-labelledby, so confirm the ARIA
    // the menu relies on still reaches the element.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger.getAttribute('aria-controls')).not.toBeNull();
    await expect(within(trigger).getByText('Valikko')).not.toBeNull();
  },
};

export const MenuButtonIsAButtonInMultiRow: StoryObj<typeof AppHeaderMenu> = {
  // Figma's multi-row ".Main menu button" (node 14151:15442) is the
  // ordinary primary Button component — icon and label side by side, not
  // stacked — unlike single-row's LabeledIconButton above.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      triggerVariant="button"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await expect(getComputedStyle(trigger).flexDirection).not.toBe('column');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger.getAttribute('aria-controls')).not.toBeNull();
    await expect(within(trigger).getByText('Valikko')).not.toBeNull();
  },
};

export const AppHeaderMultiRowMenuButtonIsAButton: StoryObj<typeof AppHeader> = {
  // End-to-end wiring check: AppHeader itself picks triggerVariant from its
  // own `layout` prop, so this goes through the real component instead of
  // AppHeaderMenu directly.
  render: () => (
    <AppHeader layout="multi-row" navigation={navigation} navAriaLabel="Päänavigaatio" />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await expect(getComputedStyle(trigger).flexDirection).not.toBe('column');
  },
};

export const MenuButtonIconSwapsWhenOpenLabelStaysDefault: StoryObj<typeof AppHeaderMenu> = {
  // The Figma "Main menu" frames (node 10718:2886 / 10718:4713) show the
  // trigger's icon swapping to a close glyph while the popover is open —
  // unlike a modal Drawer, this trigger stays visible and interactive the
  // whole time. The label itself stays "Valikko" by default (only the icon
  // signals state); `menuButtonLabelOpen` exists for a consumer who wants the
  // text to change too (see MenuButtonOpenLabelIsOverridable).
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    const closedIcon = trigger.querySelector('svg')?.outerHTML;

    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(trigger.querySelector('svg')?.outerHTML).not.toBe(closedIcon);
    });
    await expect(within(trigger).getByText('Valikko')).not.toBeNull();

    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(trigger.querySelector('svg')?.outerHTML).toBe(closedIcon);
    });
    await expect(within(trigger).getByText('Valikko')).not.toBeNull();
  },
};

export const MenuButtonOpenLabelIsOverridable: StoryObj<typeof AppHeaderMenu> = {
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      menuButtonLabelOpen="Piilota valikko"
      languagesAriaLabel="Kieli"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(within(trigger).getByText('Piilota valikko')).not.toBeNull();
    });
  },
};

export const PopoverClosesOnEscapeAndRestoresFocus: StoryObj<typeof AppHeaderMenu> = {
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await openMenuAndGetDropdown(trigger);

    await userEvent.keyboard('{Escape}');

    // Mantine's Popover supplies Escape handling (via onChange, since we run
    // fully controlled — see AppHeaderMenu.tsx); focus restoration back to
    // the trigger is ours to implement, since a non-modal Popover has no
    // built-in focus trap/return the way Drawer did.
    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    await waitFor(async () => {
      await expect(document.activeElement).toBe(trigger);
    });
  },
};

export const MenuButtonClosesMenuWhenClickedWhileOpen: StoryObj<typeof AppHeaderMenu> = {
  // Regression: the trigger button lives outside Popover.Target (see
  // menuAnchor in AppHeader.css.ts), so Mantine's own click-outside detection
  // — which only ignores clicks on the target and dropdown refs — treated a
  // click on the trigger itself as "outside", closing the menu via Mantine's
  // onClose; the trigger then re-rendered with onClick bound to `open` and
  // reopened itself on the same click. AppHeaderMenu.tsx now handles
  // click-outside manually so the trigger is never mistaken for outside.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await openMenuAndGetDropdown(trigger);
    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

export const ClickOutsideStillClosesMenu: StoryObj<typeof AppHeaderMenu> = {
  // Complements MenuButtonClosesMenuWhenClickedWhileOpen: disabling Mantine's
  // built-in click-outside handling (closeOnClickOutside={false}) in favour
  // of a manual one must not silently drop the "genuine outside click"
  // behaviour it replaces.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await openMenuAndGetDropdown(trigger);
    await userEvent.click(document.body);

    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

export const PopoverWidthIsAnchoredWideAndFullBleedNarrow: StoryObj<typeof AppHeaderMenu> = {
  // Figma node 14187:18169 (≥md, hug-content 284px box) and the 320
  // breakpoint frame embedding it (14187:18349, full container width) — a
  // fixed ~284px box anchored under the trigger at wide viewports, full
  // viewport width at 320.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await page.viewport(1500, 800);
    const wideDropdown = await openMenuAndGetDropdown(trigger);
    await expect(wideDropdown.getBoundingClientRect().width).toBeCloseTo(284, -1);
    // Figma's "Main menu" box has no border, just a drop-shadow — unlike
    // most other dropdowns in this kit (e.g. DateField's calendar popover).
    await expect(getComputedStyle(wideDropdown).borderStyle).toBe('none');
    await expect(getComputedStyle(wideDropdown).boxShadow).not.toBe('none');

    await userEvent.click(trigger);

    await page.viewport(320, 640);
    const narrowDropdown = await openMenuAndGetDropdown(trigger);
    // width="target" measures menuAnchor via floating-ui's `size` middleware,
    // which — like the position middleware — resolves asynchronously.
    await waitFor(async () => {
      await expect(narrowDropdown.getBoundingClientRect().width).toBe(320);
    });
    await expect(narrowDropdown.getBoundingClientRect().left).toBe(0);
  },
};

export const PopoverNarrowWidthMatchesHeaderBounds: StoryObj<typeof AppHeader> = {
  // The narrow full-bleed dropdown must match AppHeader's own left/right
  // bounds, not the raw viewport — AppHeader isn't always edge-to-edge (the
  // Storybook preview itself wraps every story in a margin), and a real
  // consumer may wrap it in a padded or max-width shell too.
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(400, 700);
    const header = canvas.getByRole('banner');
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    // width="target" measures menuAnchor via floating-ui's `size` middleware,
    // which — like the position middleware — resolves asynchronously.
    await waitFor(async () => {
      await expect(dropdown.getBoundingClientRect().left).toBeCloseTo(
        header.getBoundingClientRect().left,
        0
      );
      await expect(dropdown.getBoundingClientRect().right).toBeCloseTo(
        header.getBoundingClientRect().right,
        0
      );
    });
  },
};

export const PopoverSectionsOrderNavThenActionsThenLanguages: StoryObj<typeof AppHeaderMenu> = {
  // Figma node 14187:18169 stacks Navigation links, then Actions, then the
  // language selector — the reverse of the previous order (Nav, Languages,
  // Actions), so this pins the order rather than trusting visual review alone.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      languages={languages}
      currentLanguage="fi"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    // Below md, so the menu's own copies of both actions and languages are
    // visible at once (both hide themselves above their own thresholds, since
    // AppHeader's inline copies take over there instead).
    await page.viewport(480, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    const nav = within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' });
    const actionsLink = within(dropdown).getByRole('link', { name: 'Ostoskori (0)' });
    const languageNav = within(dropdown).getByRole('navigation', { name: 'Kieli' });

    await expect(
      nav.compareDocumentPosition(actionsLink) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    await expect(
      actionsLink.compareDocumentPosition(languageNav) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  },
};

export const PopoverSecondaryNavSitsBetweenPrimaryNavAndActions: StoryObj<typeof AppHeaderMenu> = {
  // secondaryNavigation (Figma node 14151:15442, multi-row only) collapses
  // into its own section between the primary nav and actions — same document
  // order the inline row uses (site name, secondary nav, languages, ...),
  // just with primary nav/menu button swapped in ahead of it here.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      languages={languages}
      currentLanguage="fi"
      secondaryNavigation={secondaryNavigation}
      secondaryNavAriaLabel="Toissijainen navigaatio"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    const nav = within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' });
    const secondaryNav = within(dropdown).getByRole('navigation', {
      name: 'Toissijainen navigaatio',
    });
    const actionsLink = within(dropdown).getByRole('link', { name: 'Ostoskori (0)' });
    const languageNav = within(dropdown).getByRole('navigation', { name: 'Kieli' });

    await expect(
      nav.compareDocumentPosition(secondaryNav) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    await expect(
      secondaryNav.compareDocumentPosition(actionsLink) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    await expect(
      actionsLink.compareDocumentPosition(languageNav) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
  },
};

export const PopoverDividerSitsBelowNavigationOnly: StoryObj<typeof AppHeaderMenu> = {
  // Only the Navigation links section has a bottom divider in Figma node
  // 14187:18169 — the old Languages-side top divider is gone. The divider
  // only makes sense when Actions actually follows Nav in the menu, so this
  // story includes `actions` — see PopoverNavHasNoDividerWithoutActions and
  // PopoverNavHasNoDividerWhenActionsStayInline for the negative cases.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      languages={languages}
      currentLanguage="fi"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    const nav = within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' });
    const languageNav = within(dropdown).getByRole('navigation', { name: 'Kieli' });

    await expect(getComputedStyle(nav).borderBottomWidth).not.toBe('0px');
    await expect(getComputedStyle(languageNav).borderBottomWidth).toBe('0px');
    await expect(getComputedStyle(languageNav).borderTopWidth).toBe('0px');
  },
};

export const PopoverNavHasNoDividerWithoutActions: StoryObj<typeof AppHeaderMenu> = {
  // No `actions` means nothing ever follows Nav in the menu, so the divider
  // that exists to separate Nav from Actions shouldn't render at all.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));
    const nav = within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' });

    await expect(getComputedStyle(nav).borderBottomWidth).toBe('0px');
  },
};

export const PopoverNavHasNoDividerWhenActionsStayInline: StoryObj<typeof AppHeaderMenu> = {
  // `actions` exists, but at md+ it has moved back into the inline row (see
  // AppHeader.css.ts's menuActions), so nothing follows Nav in the menu here
  // either — same reasoning as PopoverNavHasNoDividerWithoutActions.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1000, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));
    const nav = within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' });

    await expect(getComputedStyle(nav).borderBottomWidth).toBe('0px');
  },
};

export const PopoverSecondaryNavGetsDividerFromNavAndActions: StoryObj<typeof AppHeaderMenu> = {
  // secondaryNavigation extends the same "divider only if something follows"
  // rule PopoverDividerSitsBelowNavigationOnly established for the primary
  // nav: primary nav now gets one because secondary nav follows it, and
  // secondary nav itself gets one because actions follows *it* — languages,
  // last in the stack, still gets none.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      languages={languages}
      currentLanguage="fi"
      secondaryNavigation={secondaryNavigation}
      secondaryNavAriaLabel="Toissijainen navigaatio"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    const nav = within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' });
    const secondaryNav = within(dropdown).getByRole('navigation', {
      name: 'Toissijainen navigaatio',
    });
    const languageNav = within(dropdown).getByRole('navigation', { name: 'Kieli' });

    await expect(getComputedStyle(nav).borderBottomWidth).not.toBe('0px');
    await expect(getComputedStyle(secondaryNav).borderBottomWidth).not.toBe('0px');
    await expect(getComputedStyle(languageNav).borderBottomWidth).toBe('0px');
  },
};

export const PopoverSecondaryNavHasNoDividerWithoutActions: StoryObj<typeof AppHeaderMenu> = {
  // No `actions` means nothing follows secondary nav in the menu, so its own
  // divider shouldn't render — same reasoning as
  // PopoverNavHasNoDividerWithoutActions, one level down the stack. Primary
  // nav still gets one here, since secondary nav follows *it*.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      languages={languages}
      currentLanguage="fi"
      secondaryNavigation={secondaryNavigation}
      secondaryNavAriaLabel="Toissijainen navigaatio"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    const nav = within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' });
    const secondaryNav = within(dropdown).getByRole('navigation', {
      name: 'Toissijainen navigaatio',
    });

    await expect(getComputedStyle(nav).borderBottomWidth).not.toBe('0px');
    await expect(getComputedStyle(secondaryNav).borderBottomWidth).toBe('0px');
  },
};

export const NavKeepsItsDividerWhileSecondaryNavIsStillInTheMenu: StoryObj<typeof AppHeaderMenu> = {
  // Sections leave the menu at different widths: actions at md (768),
  // secondary nav not until lg (1024). A single 768 threshold left nav and
  // secondary nav butted together with no rule between them in that band.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      languages={languages}
      currentLanguage="fi"
      secondaryNavigation={secondaryNavigation}
      secondaryNavAriaLabel="Toissijainen navigaatio"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(900, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    const nav = within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' });
    await expect(getComputedStyle(nav).borderBottomStyle).toBe('solid');
    await expect(parseFloat(getComputedStyle(nav).borderBottomWidth)).toBeGreaterThan(0);
  },
};

export const PopoverNavListIsVerticalInsideMenu: StoryObj<typeof AppHeaderMenu> = {
  // Figma node 14187:18169's Navigation links stack top-to-bottom, unlike the
  // horizontal row navList renders inline in the header row.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    const [first, second] = within(dropdown).getAllByRole('link');
    await expect(second.getBoundingClientRect().top).toBeGreaterThan(
      first.getBoundingClientRect().bottom
    );
  },
};

export const PopoverTopAlignsWithHeaderBottomStroke: StoryObj<typeof AppHeader> = {
  // The dropdown's top edge must sit flush against the header's own bottom
  // border, not the trigger button's bottom (which sits above it by the
  // header's own vertical padding) — see AppHeaderMenu.tsx's anchor sentinel.
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1200, 800);
    const header = canvas.getByRole('banner');
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    // floating-ui computes the dropdown's position asynchronously after
    // mount, so the first paint can still be at its unpositioned default.
    await waitFor(async () => {
      await expect(dropdown.getBoundingClientRect().top).toBeCloseTo(
        header.getBoundingClientRect().bottom,
        1
      );
    });
  },
};

export const HeaderLandmarksAndSlots: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader
      layout="multi-row"
      siteName="Site name"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      search={<AppHeaderSearchField />}
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
      login={{ label: 'Kirjaudu', onClick: () => {} }}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    // Task 7 hides the inline nav below 1440 (breakpoint.xl.appWidth); this
    // story exercises the full desktop slot set, so it needs that width.
    await page.viewport(1500, 800);

    await expect(canvas.getByRole('banner')).not.toBeNull();

    // Two navigation landmarks, so each needs its own accessible name —
    // an unnamed second nav is indistinguishable to AT.
    await expect(canvas.getByRole('navigation', { name: 'Päänavigaatio' })).not.toBeNull();
    await expect(canvas.getByRole('navigation', { name: 'Kieli' })).not.toBeNull();

    // aria-current="true", not "page": the current language is the same page,
    // not a different one. Relies on NavigationLink honouring an explicit value.
    await expect(canvas.getByRole('link', { name: 'FI' })).toHaveAttribute('aria-current', 'true');
    await expect(canvas.getByRole('link', { name: 'EN' })).not.toHaveAttribute('aria-current');

    // The kit's Min-touch-target is 24px and the language links sit exactly on
    // that floor at the small breakpoints — close enough that a padding change
    // elsewhere could silently drop them under it.
    await expect(
      canvas.getByRole('link', { name: 'FI' }).getBoundingClientRect().height
    ).toBeGreaterThanOrEqual(24);

    await expect(canvas.getByLabelText('Etsi')).not.toBeNull();
    await expect(canvas.getByRole('link', { name: 'Ostoskori (0)' })).not.toBeNull();
    await expect(canvas.getByRole('button', { name: 'Kirjaudu' })).not.toBeNull();

    // The brand link names itself from the logo alone — concatenating an
    // arbitrary site name would make the accessible name unstable per consumer.
    const brand = canvas.getByRole('link', { name: 'Tampere' });
    await expect(brand).toHaveAttribute('href', '/');
    await expect(within(brand).queryByText('Site name')).toBeNull();
  },
};

export const BrandLinkHasFocusVisibleRing: StoryObj<typeof AppHeader> = {
  // brandLink previously had no focus-visible style at all, leaving the
  // browser's own default outline — same focusRing token every other
  // interactive element in the kit uses (TextLink, IconButton, NavigationLink).
  render: () => <AppHeader navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const brand = canvas.getByRole('link', { name: 'Tampere' });
    (brand as HTMLAnchorElement).focus();
    const style = getComputedStyle(brand);
    await expect(style.outlineStyle).toBe('solid');
    // focus.visible = #1e1e22 = colors.neutral['900']
    await expect(style.outlineColor).toBe('rgb(30, 30, 34)');
  },
};

export const LanguageLinksMeetTouchTargetAt320: StoryObj<typeof AppHeader> = {
  // The 24px touch-target assertion in HeaderLandmarksAndSlots runs at 1500px
  // (xl tier) — it can no longer catch a regression at the small
  // breakpoints, where p2 (14px) at 150% line-height plus linkBase's 2px
  // bottom border and no padding leaves the least headroom above the floor.
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(320, 640);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    // The kit's floor is 24px and `sm` NavigationLinks land within a pixel
    // of it at the small breakpoints — see `languageLink`.
    await expect(
      within(dropdown).getByRole('link', { name: 'FI' }).getBoundingClientRect().height
    ).toBeGreaterThanOrEqual(24);
  },
};

export const SelectedLanguageIsBold: StoryObj<typeof AppHeader> = {
  // Figma node 4250:40872's selected "FI" is a local Bold (700) override on
  // top of the link's own P2/400 base weight — see
  // appHeader.language.selectedFontWeight.
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1500, 800);
    const selected = canvas.getByRole('link', { name: 'FI' });
    const unselected = canvas.getByRole('link', { name: 'EN' });

    await expect(getComputedStyle(selected).fontWeight).toBe('700');
    await expect(getComputedStyle(unselected).fontWeight).not.toBe('700');
  },
};

export const ClickingLanguageSwitchesSelectedState: StoryObj<typeof AppHeader> = {
  // Language items can be `onClick`-driven (client-side switch, no
  // navigation) instead of `href`-driven — same href-xor-onClick shape as
  // AppHeaderActionProps. This proves the whole point of that: clicking "EN"
  // actually moves the selected/bold state there.
  render: () => {
    function Demo() {
      const [currentLanguage, setCurrentLanguage] = useState('fi');
      const clickableLanguages = languages.map((language) => ({
        code: language.code,
        label: language.label,
        onClick: () => setCurrentLanguage(language.code),
      }));
      return (
        <AppHeader
          navAriaLabel="Päänavigaatio"
          languages={clickableLanguages}
          currentLanguage={currentLanguage}
        />
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1500, 800);
    const fi = canvas.getByRole('button', { name: 'FI' });
    const en = canvas.getByRole('button', { name: 'EN' });

    await expect(fi).toHaveAttribute('aria-current', 'true');
    await expect(getComputedStyle(fi).fontWeight).toBe('700');

    await userEvent.click(en);

    await waitFor(async () => {
      await expect(en).toHaveAttribute('aria-current', 'true');
    });
    await expect(getComputedStyle(en).fontWeight).toBe('700');
    await expect(fi).not.toHaveAttribute('aria-current');
    await expect(getComputedStyle(fi).fontWeight).not.toBe('700');
  },
};

export const LanguagesMoveIntoMenuBelow1024: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(768, 800);

    // DOM selector, not getByRole: a display:none node has no accessible
    // name, so a role query cannot see it either way.
    const inline = canvasElement.querySelector('nav[aria-label="Kieli"]') as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(inline).display).toBe('none');
    });

    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));
    await expect(within(dropdown).getByRole('navigation', { name: 'Kieli' })).not.toBeNull();
    await expect(within(dropdown).getByRole('link', { name: 'FI' })).toHaveAttribute(
      'aria-current',
      'true'
    );
  },
};

export const SecondaryNavigationMovesIntoMenuBelow1024: StoryObj<typeof AppHeader> = {
  // End-to-end wiring check for the multi-row-only secondaryNavigation prop
  // (Figma node 14151:15442): same collapse threshold and mechanism as
  // languages above, exercised through the real AppHeader rather than
  // AppHeaderMenu directly.
  render: () => (
    <AppHeader
      layout="multi-row"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      secondaryNavigation={secondaryNavigation}
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(768, 800);

    const inline = canvasElement.querySelector(
      'nav[aria-label="Toissijainen navigaatio"]'
    ) as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(inline).display).toBe('none');
    });

    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));
    await expect(
      within(dropdown).getByRole('navigation', { name: 'Toissijainen navigaatio' })
    ).not.toBeNull();
    await expect(within(dropdown).getByRole('link', { name: 'Matkailijalle' })).not.toBeNull();
  },
};

export const ExactlyOneLanguageLandmarkAt1200: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    // 1200 is the band where the menu trigger exists *and* the inline
    // language links are visible — the only width where both copies could
    // land in the accessibility tree at once.
    await page.viewport(1200, 800);
    await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    await expect(within(document.body).getAllByRole('navigation', { name: 'Kieli' })).toHaveLength(
      1
    );
  },
};

export const DoesNotOverflowWithLongSiteNameAtMd: StoryObj<typeof AppHeader> = {
  // `siteName` is free consumer text with no length limit; at md (768,
  // the narrowest width where it's visible at all — it's hidden below md)
  // it must wrap rather than force the header (and the page) wider than the
  // viewport (WCAG 1.4.10 Reflow).
  render: () => (
    <AppHeader
      layout="multi-row"
      siteName="Erittäin pitkä ja kuvitteellinen sivuston nimi joka ei mahdu yhdelle riville"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');

    await page.viewport(768, 640);

    const header = canvasElement.querySelector('header') as HTMLElement;
    await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth
    );
  },
};

export const SearchAndPrimaryNavGapIs32pxAtXl: StoryObj<typeof AppHeader> = {
  // Multi-row's second row (search + primary nav/menu, node 14151:15442) is
  // gapped with the grid's layout/gutter (32px at xl), not appHeader.spacing
  // (16px) — same fix as singleRowRow's own gap override, extended here.
  render: () => (
    <AppHeader
      layout="multi-row"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      search={<AppHeaderSearchField />}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');

    await page.viewport(1500, 800);

    const search = canvasElement.querySelector('[class*="searchContainer"]') as HTMLElement;
    const nav = canvasElement.querySelector('nav[aria-label="Päänavigaatio"]') as HTMLElement;
    await waitFor(async () => {
      await expect(nav.getBoundingClientRect().left - search.getBoundingClientRect().right).toBe(
        32
      );
    });
  },
};

export const LanguagesAreOptional: StoryObj<typeof AppHeader> = {
  render: () => <AppHeader navigation={navigation} navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('banner')).not.toBeNull();
    await expect(canvas.queryByRole('navigation', { name: 'Kieli' })).toBeNull();
    await expect(canvas.getByRole('link', { name: 'Tampere' })).toHaveAttribute('href', '/');
  },
};

export const NavigationIsOptional: StoryObj<typeof AppHeader> = {
  // Regression test: `navigation` defaults to `[]`, and AppHeaderMenu used
  // to render unconditionally regardless — an omitted `navigation` produced a
  // "Valikko" button that opened an empty popover, plus an empty named `<nav>`
  // at desktop. Both are now gated on `navigation.length > 0` in AppHeader.tsx.
  render: () => <AppHeader navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('banner')).not.toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Valikko' })).toBeNull();
    await expect(canvas.queryByRole('navigation', { name: 'Päänavigaatio' })).toBeNull();
  },
};

export const InlineNavAtDesktopMenuBelow: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader navigation={navigation} navAriaLabel="Päänavigaatio" languages={languages} />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');

    // 1440 is breakpoint.xl.appWidth — inline nav only at xl/xxl, the popover
    // menu at the four breakpoints below, per Figma node 5870:42434.
    // getByRole excludes a display:none element from a real browser's
    // accessibility tree — that's the point of the CSS switch — so the two
    // elements under test here are located by a stable DOM attribute/class
    // instead, the same technique SecondaryLogoHiddenOnSmallest uses below.
    const nav = canvasElement.querySelector('nav[aria-label="Päänavigaatio"]') as HTMLElement;
    const trigger = canvasElement.querySelector('button[class*="menuButton"]') as HTMLElement;

    await page.viewport(1500, 800);
    await waitFor(async () => {
      await expect(getComputedStyle(nav).display).not.toBe('none');
    });
    await expect(getComputedStyle(trigger).display).toBe('none');

    await page.viewport(1000, 800);
    await waitFor(async () => {
      await expect(getComputedStyle(nav).display).toBe('none');
    });
    await expect(getComputedStyle(trigger).display).not.toBe('none');
  },
};

export const PopoverClosesWhenViewportReachesDesktop: StoryObj<typeof AppHeader> = {
  render: () => <AppHeader navigation={navigation} navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1000, 800);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    const controls = trigger.getAttribute('aria-controls') as string;
    await openMenuAndGetDropdown(trigger);

    // Crossing to the inline-nav width hides the trigger in CSS; leaving the
    // popover open would strand a non-dismissable, orphaned menu.
    await page.viewport(1500, 800);
    await waitFor(async () => {
      await expect(document.getElementById(controls)).toBeNull();
    });
  },
};

export const ExactlyOneNavigationLandmarkWhenMenuOpen: StoryObj<typeof AppHeader> = {
  // Locks the architecture's central invariant: the inline nav (hidden below
  // 1440 via CSS) and the popover's nav share the same `navAriaLabel`, and the
  // whole design relies on only one of them ever being in the accessibility
  // tree at once — Mantine not mounting the popover's children while closed,
  // nothing else. If that assumption ever breaks, AT sees two identically
  // named "navigation" landmarks with the menu open.
  render: () => <AppHeader navigation={navigation} navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1000, 800);
    await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    await expect(
      within(document.body).getAllByRole('navigation', { name: 'Päänavigaatio' })
    ).toHaveLength(1);
  },
};

export const SecondaryLogoHiddenOnSmallest: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader layout="multi-row" navigation={navigation} navAriaLabel="Päänavigaatio" />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');

    // Figma hides the Tampere.finland logo at 320 and shows it from 480 up.
    await page.viewport(320, 640);
    const logo = canvasElement.querySelector('svg[class*="secondaryLogo"]') as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(logo).display).toBe('none');
    });

    await page.viewport(600, 640);
    await waitFor(async () => {
      await expect(getComputedStyle(logo).display).not.toBe('none');
    });
  },
};

export const RenderLinkReceivesAriaCurrent: StoryObj<typeof AppHeaderNav> = {
  // Proves the second renderLink argument actually flows AppHeaderNav ->
  // NavigationLink -> a consumer's own anchor, not just that the type checks.
  render: () => (
    <AppHeaderNav
      ariaLabel="Päänavigaatio"
      items={[
        {
          label: 'Asiointi',
          isSelected: true,
          renderLink: (className, ariaCurrent) => (
            <a className={className} href="/asiointi" aria-current={ariaCurrent}>
              Asiointi
            </a>
          ),
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Asiointi' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};

export const Default: StoryObj<typeof AppHeader> = {
  tags: docExample,
  parameters: {
    docs: {
      description: {
        story:
          "This docs frame is ~1000px wide — below both breakpoints — so the header renders in its fully collapsed form: no inline navigation, no inline language links, menu trigger only. Open the story's Canvas view at 1440px+ to see the inline navigation and language links.",
      },
    },
  },
  render: () => (
    <AppHeader
      siteName="Site name"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      actions={[{ label: 'Haku', icon: <SearchIcon />, href: '/haku' }]}
    />
  ),
};

export const MultiRow: StoryObj<typeof AppHeader> = {
  tags: docExample,
  render: () => (
    <AppHeader
      layout="multi-row"
      siteName="Site name"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      secondaryNavigation={secondaryNavigation}
      languages={languages}
      currentLanguage="fi"
      search={<AppHeaderSearchField />}
    />
  ),
};

export const WithActions: StoryObj<typeof AppHeader> = {
  tags: docExample,
  render: () => (
    <AppHeader
      siteName="Site name"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
      login={{ label: 'Kirjaudu', onClick: () => {} }}
    />
  ),
};

export const WithoutSiteName: StoryObj<typeof AppHeader> = {
  tags: docExample,
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
};

export const InteractiveNavigationAndLanguageSelection: StoryObj<typeof AppHeader> = {
  tags: docExample,
  // The other docExample stories above use `navigation`/`languages` as-is —
  // real hrefs, so clicking a link navigates away instead of showing the
  // selected state change. Both accept a click-driven alternative instead of
  // `href` (`renderLink` for navigation items, `onClick` for language items —
  // see ClickingLanguageSwitchesSelectedState above for the language half in
  // isolation) — this demo wires both to local state so clicking "Palvelut"
  // or "EN" moves the selected/aria-current link there, nothing navigates.
  parameters: {
    docs: {
      description: {
        story:
          "Click a navigation link or a language link below — the selected state moves with the click instead of navigating away. Both are inline only in the story's Canvas view at 1440px+ (nav) / 1024px+ (languages) — this docs frame is narrower, so open Canvas to try it, or open the popover menu here.",
      },
    },
  },
  render: () => {
    function Demo() {
      const [selectedLabel, setSelectedLabel] = useState('Palvelut');
      const [currentLanguage, setCurrentLanguage] = useState('fi');

      const clickableNavigation: AppHeaderNavigationItem[] = navigation.map(({ label }) => ({
        label,
        isSelected: label === selectedLabel,
        renderLink: (className, ariaCurrent) => (
          <UnstyledButton
            type="button"
            className={className}
            aria-current={ariaCurrent}
            onClick={() => setSelectedLabel(label)}
          >
            {label}
          </UnstyledButton>
        ),
      }));

      const clickableLanguages = languages.map((language) => ({
        code: language.code,
        label: language.label,
        onClick: () => setCurrentLanguage(language.code),
      }));

      return (
        <AppHeader
          navigation={clickableNavigation}
          navAriaLabel="Päänavigaatio"
          languages={clickableLanguages}
          currentLanguage={currentLanguage}
        />
      );
    }
    return <Demo />;
  },
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1500, 800);

    await expect(canvas.getByRole('button', { name: 'Palvelut' })).toHaveAttribute(
      'aria-current',
      'page'
    );

    await userEvent.click(canvas.getByRole('button', { name: 'Yhteystiedot' }));
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Yhteystiedot' })).toHaveAttribute(
        'aria-current',
        'page'
      );
    });
    await expect(canvas.getByRole('button', { name: 'Palvelut' })).not.toHaveAttribute(
      'aria-current'
    );

    await userEvent.click(canvas.getByRole('button', { name: 'EN' }));
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'EN' })).toHaveAttribute(
        'aria-current',
        'true'
      );
    });
    await expect(canvas.getByRole('button', { name: 'FI' })).not.toHaveAttribute('aria-current');
  },
};

export const SingleRowIsTheDefault: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader
      siteName="Site name"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
      login={{ label: 'Kirjaudu', onClick: () => {} }}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1500, 800);

    // One row: the nav's parent (rightSection) is leftSection's sibling, so
    // both share the same grandparent — the row div checked below.
    const header = canvas.getByRole('banner');
    const nav = canvas.getByRole('navigation', { name: 'Päänavigaatio' });
    const brand = canvas.getByRole('link', { name: 'Tampere' });
    await expect(nav.closest('header')).toBe(header);
    await expect(nav.parentElement?.parentElement).toBe(brand.closest('header')?.firstElementChild);

    // Figma hides the Tampere.finland logo at every single-row breakpoint.
    await expect(canvasElement.querySelector('svg[class*="secondaryLogo"]')).toBeNull();

    // Right-section child order per Figma node 14147:11664: nav -> languages
    // -> actions -> login -> menu trigger. Regression lock for the order
    // the final review previously found swapped (nav rendered last instead
    // of first), extended to cover the dedicated login slot.
    const rightSectionEl = nav.parentElement as HTMLElement;
    const languageNav = canvas.getByRole('navigation', { name: 'Kieli' });
    const actionsLink = canvas.getByRole('link', { name: 'Ostoskori (0)' });
    const login = canvas.getByRole('button', { name: 'Kirjaudu' });
    const trigger = canvasElement.querySelector('button[class*="menuButton"]') as HTMLElement;
    const rightChildren = Array.from(rightSectionEl.children);
    const navIndex = rightChildren.indexOf(nav);
    const languageIndex = rightChildren.indexOf(languageNav);
    // The inline `actions` copy is wrapped in a div (hidden below md, shown
    // md+) now that it can move into the popover menu — the wrapper, not the
    // link itself, is rightSectionEl's direct child.
    const actionsIndex = rightChildren.indexOf(actionsLink.parentElement as HTMLElement);
    const loginIndex = rightChildren.indexOf(login);
    const triggerIndex = rightChildren.indexOf(trigger);
    await expect(navIndex).toBeGreaterThanOrEqual(0);
    await expect(languageIndex).toBeGreaterThan(navIndex);
    await expect(actionsIndex).toBeGreaterThan(languageIndex);
    await expect(loginIndex).toBeGreaterThan(actionsIndex);
    await expect(triggerIndex).toBeGreaterThan(loginIndex);
  },
};

export const LoginInvokesOnClickAndDefaultsToLoginIcon: StoryObj<typeof AppHeader> = {
  render: () => {
    const onLoginClick = () => {
      document.body.dataset.loginClicked = 'true';
    };
    return (
      <AppHeader
        navigation={navigation}
        navAriaLabel="Päänavigaatio"
        login={{ label: 'Kirjaudu', onClick: onLoginClick }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    delete document.body.dataset.loginClicked;

    const login = canvas.getByRole('button', { name: 'Kirjaudu' });
    // Icon-over-label layout, same as LabeledIconButton elsewhere — confirms
    // `login` renders through it rather than some bespoke markup.
    await expect(getComputedStyle(login).flexDirection).toBe('column');
    await expect(login.querySelector('svg')).not.toBeNull();

    await userEvent.click(login);
    await expect(document.body.dataset.loginClicked).toBe('true');
  },
};

export const LoginIconAndLabelAreOverridable: StoryObj<typeof AppHeader> = {
  // Matches Figma node 14166:4271 — the same dedicated slot shows a person
  // icon + the user's name once authenticated, rather than a second slot.
  render: () => (
    <AppHeader
      navAriaLabel="Päänavigaatio"
      login={{ label: 'Etunimi', icon: <UserIcon />, onClick: () => {} }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Etunimi' })).not.toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Kirjaudu' })).toBeNull();
  },
};

export const LoginRendersAsLinkViaRenderRoot: StoryObj<typeof AppHeader> = {
  // Proves `renderRoot` actually flows AppHeader -> LabeledIconButton ->
  // Mantine's Box, not just that the type checks.
  render: () => (
    <AppHeader
      navAriaLabel="Päänavigaatio"
      login={{
        label: 'Kirjaudu',
        renderRoot: (props) => <a href="/kirjaudu" {...props} />,
      }}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const login = canvas.getByRole('link', { name: 'Kirjaudu' });
    await expect(login).toHaveAttribute('href', '/kirjaudu');
    await expect(canvas.queryByRole('button', { name: 'Kirjaudu' })).toBeNull();
  },
};

export const LoginRendersAsLinkViaHref: StoryObj<typeof AppHeader> = {
  // Mirrors LoginRendersAsLinkViaRenderRoot's assertion, through the simpler
  // `href` shorthand `actions` already had — added so the common "login is a
  // link" case doesn't need a hand-rolled renderRoot.
  render: () => (
    <AppHeader navAriaLabel="Päänavigaatio" login={{ label: 'Kirjaudu', href: '/kirjaudu' }} />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const login = canvas.getByRole('link', { name: 'Kirjaudu' });
    await expect(login).toHaveAttribute('href', '/kirjaudu');
    await expect(canvas.queryByRole('button', { name: 'Kirjaudu' })).toBeNull();
  },
};

export const SiteNameUsesSubheaderStyle: StoryObj<typeof AppHeader> = {
  // Both layouts share one siteName class, resolving to the subheader token
  // (20px at xl/xxl) — single-row's node 14147:8543 and multi-row's own
  // 14151:15447 agree on this, so nothing layout-specific to assert here.
  render: () => (
    <AppHeader siteName="Site name" navigation={navigation} navAriaLabel="Päänavigaatio" />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');

    await page.viewport(1500, 800);
    const siteNameEl = canvasElement.querySelector('span[class*="siteName"]') as HTMLElement;

    await waitFor(async () => {
      await expect(getComputedStyle(siteNameEl).fontSize).toBe('20px');
    });
  },
};

export const SiteNameIsLiftedTwoPixels: StoryObj<typeof AppHeader> = {
  render: () => <AppHeader siteName="Site name" navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    await page.viewport(1500, 800);

    const siteNameEl = canvasElement.querySelector('span[class*="siteName"]') as HTMLElement;
    await waitFor(async () => {
      // matrix(1, 0, 0, 1, tx, ty) — ty is the translateY in px.
      await expect(getComputedStyle(siteNameEl).transform).toBe('matrix(1, 0, 0, 1, 0, -2)');
    });
  },
};

export const MultiRowIsOptIn: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader
      layout="multi-row"
      siteName="Site name"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      search={<AppHeaderSearchField />}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1500, 800);

    // Two rows, and the search slot lives in the second one.
    const header = canvas.getByRole('banner');
    await expect(header.children).toHaveLength(2);
    await expect(header.children[1].contains(canvas.getByLabelText('Etsi'))).toBe(true);
    await expect(canvasElement.querySelector('svg[class*="secondaryLogo"]')).not.toBeNull();
  },
};

export const MultiRowLoginSitsBetweenActionsAndSecondaryLogo: StoryObj<typeof AppHeader> = {
  // Right-section child order per Figma node 3898:2196 (multi-row): languages
  // -> actions -> login -> secondary logo.
  render: () => (
    <AppHeader
      layout="multi-row"
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
      login={{ label: 'Kirjaudu', onClick: () => {} }}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1500, 800);

    const languageNav = canvas.getByRole('navigation', { name: 'Kieli' });
    const actionsLink = canvas.getByRole('link', { name: 'Ostoskori (0)' });
    const login = canvas.getByRole('button', { name: 'Kirjaudu' });
    const secondaryLogoEl = canvasElement.querySelector(
      'svg[class*="secondaryLogo"]'
    ) as SVGElement;

    const rightSectionEl = languageNav.parentElement as HTMLElement;
    const rightChildren = Array.from(rightSectionEl.children);
    const languageIndex = rightChildren.indexOf(languageNav);
    const actionsIndex = rightChildren.indexOf(actionsLink);
    const loginIndex = rightChildren.indexOf(login);
    const logoIndex = rightChildren.indexOf(secondaryLogoEl);

    await expect(languageIndex).toBeGreaterThanOrEqual(0);
    await expect(actionsIndex).toBeGreaterThan(languageIndex);
    await expect(loginIndex).toBeGreaterThan(actionsIndex);
    await expect(logoIndex).toBeGreaterThan(loginIndex);
  },
};

export const MultiRowRightSectionHasNoPhantomActionsGap: StoryObj<typeof AppHeader> = {
  // inlineActionsEl wrapped `actions` in a div whenever a menu existed, even
  // with no `actions` at all — an empty flex child still takes a full
  // appHeader.spacing gap from its neighbours (MultiRow/WithoutSiteName hit
  // this silently since neither has a play function).
  render: () => (
    <AppHeader
      layout="multi-row"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    await page.viewport(1500, 800);

    const rightSectionEl = canvasElement.querySelectorAll(
      'div[class*="rightSection"]'
    )[0] as HTMLElement;
    // Without the bug: language nav + secondary logo, nothing else.
    await expect(rightSectionEl.children).toHaveLength(2);
  },
};

export const MultiRowSearchSpansFullWidthWithoutNavigation: StoryObj<typeof AppHeader> = {
  // The second row's `rightSection` wrapper rendered unconditionally too —
  // with no `navigation` both its children are null, but the empty wrapper
  // still counted as a flex item, so multiRowSearchRow's row-gap token was
  // subtracted from search's own flexGrow:1 width for nothing.
  render: () => (
    <AppHeader layout="multi-row" navAriaLabel="Päänavigaatio" search={<AppHeaderSearchField />} />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    await page.viewport(1500, 800);

    const searchRow = canvasElement.querySelector('div[class*="multiRowSearchRow"]') as HTMLElement;
    const searchContainerEl = canvasElement.querySelector(
      'div[class*="searchContainer"]'
    ) as HTMLElement;
    await expect(searchContainerEl.getBoundingClientRect().right).toBe(
      searchRow.getBoundingClientRect().right
    );
  },
};

export const MultiRowOmitsTheSecondRowWhenEmpty: StoryObj<typeof AppHeader> = {
  render: () => <AppHeader layout="multi-row" navAriaLabel="Päänavigaatio" siteName="Site name" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // An empty second row still costs a row gap under the header.
    await expect(canvas.getByRole('banner').children).toHaveLength(1);
  },
};

// Locks decision 3 of the spec: `search` is meaningless in single-row, so the
// union must reject it. `tsc --noEmit` fails if this ever stops erroring.
export const SearchIsForbiddenInSingleRow: StoryObj<typeof AppHeader> = {
  render: () => (
    // TS attributes a JSX-prop-union mismatch to the opening tag, not the
    // offending attribute, so the directive has to precede the tag itself.
    // @ts-expect-error — `search` requires layout="multi-row"
    <AppHeader navAriaLabel="Päänavigaatio" search={<input aria-label="Etsi" />} />
  ),
};

// Locks the same decision as SearchIsForbiddenInSingleRow above, for
// secondaryNavigation — Figma node 14151:15442 is multi-row only, so the
// union must reject it in single-row too. `tsc --noEmit` fails if this ever
// stops erroring.
export const SecondaryNavigationIsForbiddenInSingleRow: StoryObj<typeof AppHeader> = {
  render: () => (
    // @ts-expect-error — `secondaryNavigation` requires layout="multi-row"
    <AppHeader navAriaLabel="Päänavigaatio" secondaryNavigation={secondaryNavigation} />
  ),
};

export const LanguagesStayVisibleWithoutNavigation: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader navAriaLabel="Päänavigaatio" languages={languages} currentLanguage="fi" />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(320, 640);

    // No navigation means no menu, so hiding the language links below 1024
    // would leave no way to switch language at all.
    const languageNav = canvasElement.querySelector('nav[aria-label="Kieli"]') as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(languageNav).display).not.toBe('none');
    });
    await expect(canvas.queryByRole('button', { name: 'Valikko' })).toBeNull();
  },
};

export const SiteNameHiddenAtSmAndBelow: StoryObj<typeof AppHeader> = {
  // Figma's breakpoint sheet (node 14147:8539) drops the site name entirely
  // at sm/xs (480/320) — it only appears from md (768) up.
  render: () => <AppHeader siteName="Site name" navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const siteNameEl = canvasElement.querySelector('span[class*="siteName"]') as HTMLElement;

    await page.viewport(480, 640);
    await waitFor(async () => {
      await expect(getComputedStyle(siteNameEl).display).toBe('none');
    });

    await page.viewport(768, 640);
    await waitFor(async () => {
      await expect(getComputedStyle(siteNameEl).display).not.toBe('none');
    });
  },
};

export const ActionsMoveIntoMenuAtSmAndBelow: StoryObj<typeof AppHeader> = {
  // Figma node 14187:18169's Actions section renders as NavigationLink +
  // startIcon in the menu — but LabeledIconButton inline (node 14147:11664),
  // so `actions` is structured data, not a single shared ReactNode: AppHeader
  // builds each representation itself, per context.
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);

    // DOM selector, not getByRole: a display:none node has no accessible
    // name — mirrors LanguagesMoveIntoMenuBelow1024's technique.
    const inlineActionsEl = canvasElement.querySelector(
      'div[class*="inlineActions"]'
    ) as HTMLElement;
    await waitFor(async () => {
      await expect(getComputedStyle(inlineActionsEl).display).toBe('none');
    });

    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));
    await expect(within(dropdown).getByRole('link', { name: 'Ostoskori (0)' })).not.toBeNull();
  },
};

export const ActionsStayInlineFromMdUp: StoryObj<typeof AppHeader> = {
  // Complements ActionsMoveIntoMenuAtSmAndBelow: at md+ the inline copy is
  // the only one visible, and the popover's own copy (present whenever
  // `navigation` exists) must not also show, or the accessible name
  // "Ostoskori (0)" would exist twice at once if the menu were ever opened.
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(768, 800);
    await waitFor(async () => {
      await expect(canvas.getByRole('link', { name: 'Ostoskori (0)' })).toBeVisible();
    });

    await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));
    await expect(
      within(document.body).getAllByRole('link', { name: 'Ostoskori (0)' })
    ).toHaveLength(1);
  },
};

export const ActionsStayInlineWithoutNavigation: StoryObj<typeof AppHeader> = {
  // No navigation means no menu, so moving `actions` there below md would
  // strand it entirely — same reasoning as LanguagesStayVisibleWithoutNavigation.
  render: () => (
    <AppHeader
      navAriaLabel="Päänavigaatio"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(320, 640);
    await expect(canvas.getByRole('link', { name: 'Ostoskori (0)' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Valikko' })).toBeNull();
  },
};

export const MenuPanelIsReachableByTabFromTrigger: StoryObj<typeof AppHeaderMenu> = {
  // The panel is the only way to reach the primary nav below xl, so it has to
  // come straight after its trigger in tab order. Mantine portals Popover to
  // the end of <body> by default, which puts every other focusable element on
  // the page in between (WCAG 2.4.3).
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    const dropdown = await openMenuAndGetDropdown(trigger);

    trigger.focus();
    await userEvent.tab();

    await expect(dropdown.contains(document.activeElement)).toBe(true);
  },
};

export const MultipleInlineActionsShareOneRow: StoryObj<typeof AppHeader> = {
  // Every other story passes a single action, which is why a block-level
  // wrapper went unnoticed: with two, they stack with no gap — and the
  // no-menu path renders the same actions as flex children, so the layout
  // would silently depend on whether `navigation` was passed.
  render: () => (
    <AppHeader
      siteName="Tampere"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      actions={[
        { label: 'Haku', icon: <SearchIcon />, href: '/haku' },
        { label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1200, 800);
    const haku = canvas.getByRole('link', { name: 'Haku' });
    const kori = canvas.getByRole('link', { name: 'Ostoskori (0)' });

    await expect(haku.getBoundingClientRect().top).toBe(kori.getBoundingClientRect().top);
    await expect(kori.getBoundingClientRect().left).toBeGreaterThan(
      haku.getBoundingClientRect().right
    );
  },
};

export const MenuClosesWhenALanguageIsSelectedClientSide: StoryObj<typeof AppHeaderMenu> = {
  // `onClick` languages and `renderLink` nav items switch in place instead of
  // navigating, so nothing else dismisses the panel — it stayed open over the
  // content with the selection changed invisibly behind it.
  render: function Render() {
    const [current, setCurrent] = useState('fi');
    return (
      <AppHeaderMenu
        items={navigation}
        navAriaLabel="Päänavigaatio"
        menuButtonLabel="Valikko"
        languagesAriaLabel="Kieli"
        languages={[
          { code: 'fi', label: 'FI', onClick: () => setCurrent('fi') },
          { code: 'en', label: 'EN', onClick: () => setCurrent('en') },
        ]}
        currentLanguage={current}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    const dropdown = await openMenuAndGetDropdown(trigger);

    await userEvent.click(within(dropdown).getByRole('button', { name: 'EN' }));

    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

export const MenuClosesWhenANavItemIsActivatedClientSide: StoryObj<typeof AppHeaderMenu> = {
  // Equivalent of MenuClosesWhenALanguageIsSelectedClientSide for the other
  // client-side path: a `renderLink` nav item that switches selection in
  // place instead of navigating.
  render: function Render() {
    const [selectedLabel, setSelectedLabel] = useState('Palvelut');
    const clickableNavigation: AppHeaderNavigationItem[] = navigation.map(({ label }) => ({
      label,
      isSelected: label === selectedLabel,
      renderLink: (className, ariaCurrent) => (
        <UnstyledButton
          type="button"
          className={className}
          aria-current={ariaCurrent}
          onClick={() => setSelectedLabel(label)}
        >
          {label}
        </UnstyledButton>
      ),
    }));
    return (
      <AppHeaderMenu
        items={clickableNavigation}
        navAriaLabel="Päänavigaatio"
        menuButtonLabel="Valikko"
        languagesAriaLabel="Kieli"
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    const dropdown = await openMenuAndGetDropdown(trigger);

    await userEvent.click(within(dropdown).getByRole('button', { name: 'Asiointi' }));

    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

// Only destructures `children` — any other prop a caller passes (including
// the `onClick` the fix wires in) lands on the component and is dropped,
// simulating a consumer whose renderLink component never forwards onClick to
// its own DOM node. A <button>, not the brief's illustrative <a href>: a real
// anchor navigation crashes the browser-mode test runner, which is exactly
// the kind of test-tool accommodation this codebase avoids (see
// ClickingLanguageSwitchesSelectedState) — button-rendered renderLink items
// are already an established pattern here (MenuClosesWhenANavItemIsActivatedClientSide).
function Opaque({ children }: { children: ReactNode }) {
  return <button type="button">{children}</button>;
}

export const MenuStillClosesWhenRenderLinkDoesNotForwardOnClick: StoryObj<typeof AppHeaderMenu> = {
  // cloneElement-based closing (the original fix for this finding) silently
  // fails here: Opaque drops the onClick it's handed, so nothing ever calls
  // handleClose. The menu must still close via some other mechanism.
  render: function Render() {
    return (
      <AppHeaderMenu
        items={navigation.map(({ label }) => ({
          label,
          renderLink: () => <Opaque>{label}</Opaque>,
        }))}
        navAriaLabel="Päänavigaatio"
        menuButtonLabel="Valikko"
        languagesAriaLabel="Kieli"
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    const dropdown = await openMenuAndGetDropdown(trigger);

    await userEvent.click(within(dropdown).getByRole('button', { name: 'Asiointi' }));

    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

// A real ARIA button that isn't a native `<button>` or `<a>` — a tag-name-based
// guard on the delegated close listener misses this shape even though a click
// on it is a genuine activation.
function DivButton({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick}>
      {children}
    </div>
  );
}

export const MenuStillClosesWhenRenderLinkReturnsANonNativeInteractiveElement: StoryObj<
  typeof AppHeaderMenu
> = {
  render: function Render() {
    const [selectedLabel, setSelectedLabel] = useState('Palvelut');
    return (
      <AppHeaderMenu
        items={navigation.map(({ label }) => ({
          label,
          isSelected: label === selectedLabel,
          renderLink: () => <DivButton onClick={() => setSelectedLabel(label)}>{label}</DivButton>,
        }))}
        navAriaLabel="Päänavigaatio"
        menuButtonLabel="Valikko"
        languagesAriaLabel="Kieli"
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    const dropdown = await openMenuAndGetDropdown(trigger);

    await userEvent.click(within(dropdown).getByRole('button', { name: 'Asiointi' }));

    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

export const MenuClosesWhenAnActionIsActivatedClientSide: StoryObj<typeof AppHeaderMenu> = {
  // Third client-side path, not named in the original finding but identical
  // in kind: an `onClick` action (no `href`) also switches state in place
  // rather than navigating.
  render: function Render() {
    const [count, setCount] = useState(0);
    return (
      <AppHeaderMenu
        items={navigation}
        navAriaLabel="Päänavigaatio"
        menuButtonLabel="Valikko"
        languagesAriaLabel="Kieli"
        actions={[
          {
            label: `Ostoskori (${count})`,
            icon: <CartIcon />,
            onClick: () => setCount((previous) => previous + 1),
          },
        ]}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    const dropdown = await openMenuAndGetDropdown(trigger);

    await userEvent.click(within(dropdown).getByRole('button', { name: /Ostoskori/ }));

    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
  },
};

export const MenuClosesWhenASecondaryNavItemIsActivatedClientSide: StoryObj<typeof AppHeaderMenu> =
  {
    // secondaryNavigation shares closeMenuOnActivation with the primary
    // `items` nav (see MenuClosesWhenANavItemIsActivatedClientSide) but had no
    // story exercising its own close path.
    render: function Render() {
      const [selectedLabel, setSelectedLabel] = useState('Matkailijalle');
      const clickableSecondaryNavigation: AppHeaderNavigationItem[] = secondaryNavigation.map(
        ({ label }) => ({
          label,
          isSelected: label === selectedLabel,
          renderLink: (className, ariaCurrent) => (
            <UnstyledButton
              type="button"
              className={className}
              aria-current={ariaCurrent}
              onClick={() => setSelectedLabel(label)}
            >
              {label}
            </UnstyledButton>
          ),
        })
      );
      return (
        <AppHeaderMenu
          items={navigation}
          secondaryNavigation={clickableSecondaryNavigation}
          navAriaLabel="Päänavigaatio"
          secondaryNavAriaLabel="Toissijainen navigaatio"
          menuButtonLabel="Valikko"
          languagesAriaLabel="Kieli"
        />
      );
    },
    play: async ({ canvasElement }) => {
      const { page } = await import('@vitest/browser/context');
      const canvas = within(canvasElement);

      // secondaryNavigation's menu section is only visible below `lg`
      // (menuSecondaryNavVisibility in AppHeader.css.ts) — display:none
      // above that removes it from the accessibility tree entirely.
      await page.viewport(480, 800);
      const trigger = canvas.getByRole('button', { name: 'Valikko' });
      const dropdown = await openMenuAndGetDropdown(trigger);

      await userEvent.click(within(dropdown).getByRole('button', { name: 'Osallistuminen' }));

      await waitFor(async () => {
        await expect(trigger).toHaveAttribute('aria-expanded', 'false');
      });
    },
  };

export const IconlessMenuActionHasNoEmptyIconBox: StoryObj<typeof AppHeaderMenu> = {
  // `icon` is optional on AppHeaderActionProps, and the href branch renders
  // nothing without one — the onClick branch reserved the 18px box anyway,
  // indenting the label against its neighbours.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      actions={[{ label: 'Kirjaudu ulos', onClick: () => {} }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    const action = within(dropdown).getByRole('button', { name: 'Kirjaudu ulos' });
    await expect(action.querySelector(`.${navigationLinkIconWrapper}`)).toBeNull();
  },
};

export const IconfulMenuActionHasIconBoxInOnClickBranch: StoryObj<typeof AppHeaderMenu> = {
  // The onClick branch renders a manual navigationLinkIconWrapper span when
  // an icon is present — this story asserts it exists and contains the icon.
  // MenuClosesWhenAnActionIsActivatedClientSide hits the same code path but
  // only asserts aria-expanded, leaving the wrapper's presence unguarded.
  render: () => (
    <AppHeaderMenu
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      languagesAriaLabel="Kieli"
      actions={[{ label: 'Ostoskori (0)', icon: <CartIcon />, onClick: () => {} }]}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(480, 800);
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    const action = within(dropdown).getByRole('button', { name: 'Ostoskori (0)' });
    const wrapper = action.querySelector(`.${navigationLinkIconWrapper}`);
    await expect(wrapper).not.toBeNull();
    await expect(wrapper?.querySelector('svg')).not.toBeNull();
  },
};

export const MenuDropdownSharesPaperDropShadowToken: StoryObj<typeof AppHeaderMenu> = {
  // menuDropdown re-inlined the same shadow shape dropShadowTile already
  // captures (Paper/Accordion's shared tile shadow) as a raw literal instead
  // of reusing the token — this pins them to stay identical.
  render: () => (
    <>
      <Paper withShadow data-testid="reference-shadow">
        reference
      </Paper>
      <AppHeaderMenu
        items={navigation}
        navAriaLabel="Päänavigaatio"
        menuButtonLabel="Valikko"
        languagesAriaLabel="Kieli"
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const reference = canvas.getByTestId('reference-shadow');
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    await expect(getComputedStyle(dropdown).boxShadow).toBe(getComputedStyle(reference).boxShadow);
  },
};

// Consumers type their own arrays against these, so a missing re-export is a
// break even though nothing fails at runtime. `satisfies` makes tsc the test.
const actionsTypeProbe = [
  { label: 'Ostoskori (0)', icon: <CartIcon />, href: '/ostoskori' },
] satisfies AppHeaderActionProps[];
void actionsTypeProbe;
