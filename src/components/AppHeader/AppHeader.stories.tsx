import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { AppHeaderNav } from './AppHeaderNav';
import { AppHeaderDrawer } from './AppHeaderDrawer';
import { AppHeader } from './AppHeader';
import { Button } from '../Button/Button';

const navigation = [
  { label: 'Palvelut', href: '/palvelut' },
  { label: 'Asiointi', href: '/asiointi', isSelected: true },
  { label: 'Yhteystiedot', href: '/yhteystiedot' },
];

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

export const DrawerOpensAndWiresAria: StoryObj<typeof AppHeaderDrawer> = {
  render: () => (
    <AppHeaderDrawer
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      drawerTitle="Valikko"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await expect(trigger).toHaveAttribute('aria-expanded', 'false');

    const controls = trigger.getAttribute('aria-controls');
    await expect(controls).not.toBeNull();

    await userEvent.click(trigger);

    await expect(trigger).toHaveAttribute('aria-expanded', 'true');
    // aria-controls must resolve to a real element once the panel exists,
    // otherwise the relationship is a dangling reference. waitFor because
    // Mantine's Drawer mount transition renders its content a tick after
    // `opened` flips (see Modal.stories.tsx for the same gotcha).
    await waitFor(() => {
      expect(document.getElementById(controls as string)).not.toBeNull();
    });

    // The drawer renders in a portal, so query the document, not the canvas.
    // findByRole (not getByRole): same mount-transition delay as above.
    const dialog = await within(document.body).findByRole('dialog');
    // Confirms aria-controls points at the actual dialog, not merely *some*
    // element with that id — a future regression could satisfy the earlier
    // getElementById check while the real dialog goes unlabelled.
    await expect(dialog.id).toBe(controls);
    await expect(within(dialog).getByRole('navigation', { name: 'Päänavigaatio' })).not.toBeNull();
  },
};

export const DrawerClosesOnEscapeAndRestoresFocus: StoryObj<typeof AppHeaderDrawer> = {
  render: () => (
    <AppHeaderDrawer
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      drawerTitle="Valikko"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await userEvent.click(trigger);
    // findByRole: waits out Mantine's mount transition (see above story).
    await within(document.body).findByRole('dialog');

    await userEvent.keyboard('{Escape}');

    // Mantine supplies escape handling and focus restoration; assert we get
    // them rather than reimplementing either.
    await waitFor(async () => {
      await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    });
    await waitFor(async () => {
      await expect(document.activeElement).toBe(trigger);
    });
  },
};

export const DrawerCloseButtonHasAccessibleName: StoryObj<typeof AppHeaderDrawer> = {
  // Regression test for #94's bug class: Mantine's Drawer.CloseButton has no
  // default aria-label, so an icon-only close button can ship with no
  // accessible name (see Modal.stories.tsx's CloseButtonHasAccessibleName).
  render: () => (
    <AppHeaderDrawer
      items={navigation}
      navAriaLabel="Päänavigaatio"
      menuButtonLabel="Valikko"
      drawerTitle="Valikko"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });

    await userEvent.click(trigger);
    // findByRole: waits out Mantine's mount transition (see the stories above).
    const closeButton = await within(document.body).findByRole('button', {
      name: 'Sulje valikko',
    });
    await expect(closeButton).toBeInTheDocument();
  },
};

const languages = [
  { code: 'fi', label: 'FI', href: '/fi' },
  { code: 'en', label: 'EN', href: '/en' },
];

export const HeaderLandmarksAndSlots: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader
      siteName="{Nimi}"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      search={<input aria-label="Etsi" placeholder="Etsi" />}
      actions={<button type="button">Kirjaudu</button>}
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
    await expect(canvas.getByRole('button', { name: 'Kirjaudu' })).not.toBeNull();

    // The brand link names itself from the logo alone — concatenating an
    // arbitrary site name would make the accessible name unstable per consumer.
    const brand = canvas.getByRole('link', { name: 'Tampere' });
    await expect(brand).toHaveAttribute('href', '/');
    await expect(within(brand).queryByText('{Nimi}')).toBeNull();
  },
};

export const LanguageLinksMeetTouchTargetAt320: StoryObj<typeof AppHeader> = {
  tags: ['!dev', '!autodocs'],
  // The 24px touch-target assertion in HeaderLandmarksAndSlots runs at 1500px
  // (xxl tier) since Task 7 set that story's viewport there — it can no
  // longer catch a regression at the small breakpoints, where p2 (14px) at
  // 150% line-height plus linkBase's 2px bottom border and no padding leaves
  // the least headroom above the floor.
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

    const height = canvas.getByRole('link', { name: 'FI' }).getBoundingClientRect().height;
    await expect(height).toBeGreaterThanOrEqual(24);
  },
};

export const DoesNotOverflowWithLongSiteNameAt320: StoryObj<typeof AppHeader> = {
  tags: ['!dev', '!autodocs'],
  // `siteName` is free consumer text with no length limit; at 320px it must
  // wrap rather than force the header (and the page) wider than the viewport
  // (WCAG 1.4.10 Reflow).
  render: () => (
    <AppHeader
      siteName="Erittäin pitkä ja kuvitteellinen sivuston nimi joka ei mahdu yhdelle riville"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');

    await page.viewport(320, 640);

    const header = canvasElement.querySelector('header') as HTMLElement;
    await expect(header.scrollWidth).toBeLessThanOrEqual(header.clientWidth);
    await expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
      document.documentElement.clientWidth
    );
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
  // Regression test: `navigation` defaults to `[]`, and AppHeaderDrawer used
  // to render unconditionally regardless — an omitted `navigation` produced a
  // "Valikko" button that opened an empty dialog, plus an empty named `<nav>`
  // at desktop. Both are now gated on `navigation.length > 0` in AppHeader.tsx.
  render: () => <AppHeader navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('banner')).not.toBeNull();
    await expect(canvas.queryByRole('button', { name: 'Valikko' })).toBeNull();
    await expect(canvas.queryByRole('navigation', { name: 'Päänavigaatio' })).toBeNull();
  },
};

export const InlineNavAtDesktopDrawerBelow: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader navigation={navigation} navAriaLabel="Päänavigaatio" languages={languages} />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');

    // 1440 is breakpoint.xl.appWidth — inline nav only at xl/xxl, drawer at
    // the four breakpoints below, per Figma node 5870:42434.
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

export const DrawerClosesWhenViewportReachesDesktop: StoryObj<typeof AppHeader> = {
  render: () => <AppHeader navigation={navigation} navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1000, 800);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    await userEvent.click(trigger);
    // findByRole: waits out Mantine's mount transition (see DrawerOpensAndWiresAria).
    // Reaching the next line already confirms the dialog exists — findByRole
    // throws otherwise.
    await within(document.body).findByRole('dialog');

    // Crossing to the inline-nav width hides the trigger in CSS; leaving the
    // drawer open would strand its focus trap with no visible way back.
    await page.viewport(1500, 800);
    await waitFor(async () => {
      await expect(within(document.body).queryByRole('dialog')).toBeNull();
    });
  },
};

export const ExactlyOneNavigationLandmarkWhenDrawerOpen: StoryObj<typeof AppHeader> = {
  // Locks the architecture's central invariant: the inline nav (hidden below
  // 1440 via CSS) and the drawer nav share the same `navAriaLabel`, and the
  // whole design relies on only one of them ever being in the accessibility
  // tree at once — Mantine not mounting the drawer's children while closed,
  // nothing else. If that assumption ever breaks, AT sees two identically
  // named "navigation" landmarks with the drawer open.
  render: () => <AppHeader navigation={navigation} navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1000, 800);
    const trigger = canvas.getByRole('button', { name: 'Valikko' });
    await userEvent.click(trigger);
    // findByRole: waits out Mantine's mount transition (see DrawerOpensAndWiresAria).
    await within(document.body).findByRole('dialog');

    await expect(
      within(document.body).getAllByRole('navigation', { name: 'Päänavigaatio' })
    ).toHaveLength(1);
  },
};

export const SecondaryLogoHiddenOnSmallest: StoryObj<typeof AppHeader> = {
  render: () => <AppHeader navigation={navigation} navAriaLabel="Päänavigaatio" />,
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
  render: () => (
    <AppHeader
      siteName="{Nimi}"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
    />
  ),
};

export const WithSearch: StoryObj<typeof AppHeader> = {
  tags: docExample,
  render: () => (
    <AppHeader
      siteName="{Nimi}"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      search={<input aria-label="Etsi" placeholder="Etsi" />}
    />
  ),
};

export const WithActions: StoryObj<typeof AppHeader> = {
  tags: docExample,
  render: () => (
    <AppHeader
      siteName="{Nimi}"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      actions={<Button variant="secondary">Kirjaudu</Button>}
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
