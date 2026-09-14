import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { AppHeaderNav } from './AppHeaderNav';
import { AppHeaderMenu } from './AppHeaderMenu';
import { AppHeader } from './AppHeader';
import { LabeledIconButton } from '../LabeledIconButton';
import { SearchIcon } from '../../icons/SearchIcon';
import { UserIcon } from '../../icons/UserIcon';
import { CartIcon } from '../../icons/CartIcon';

const navigation = [
  { label: 'Palvelut', href: '/palvelut' },
  { label: 'Asiointi', href: '/asiointi', isSelected: true },
  { label: 'Yhteystiedot', href: '/yhteystiedot' },
];

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
    // The popover renders in a portal, so query the document, not the canvas.
    await expect(
      within(dropdown).getByRole('navigation', { name: 'Päänavigaatio' })
    ).not.toBeNull();
  },
};

export const MenuButtonIsALabeledIconButton: StoryObj<typeof AppHeaderMenu> = {
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

    // LabeledIconButton stacks its icon above the label; the horizontal
    // Button it replaced is what Figma's .Main menu button is not.
    await expect(getComputedStyle(trigger).flexDirection).toBe('column');

    // It omits and strips aria-label/aria-labelledby, so confirm the ARIA
    // the menu relies on still reaches the element.
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await expect(trigger.getAttribute('aria-controls')).not.toBeNull();
    await expect(within(trigger).getByText('Valikko')).not.toBeNull();
  },
};

export const MenuButtonSwapsIconAndLabelWhenOpen: StoryObj<typeof AppHeaderMenu> = {
  // The Figma "Main menu" frames (node 10718:2886 / 10718:4713) show the
  // trigger itself swapping to a close icon + "Sulje" while the popover is
  // open — unlike a modal Drawer, this trigger stays visible and interactive
  // the whole time, so leaving it saying "Valikko" while open would be stale.
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

    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(within(trigger).getByText('Sulje')).not.toBeNull();
    });
    await expect(within(trigger).queryByText('Valikko')).toBeNull();

    await userEvent.click(trigger);

    await waitFor(async () => {
      await expect(within(trigger).getByText('Valikko')).not.toBeNull();
    });
    await expect(within(trigger).queryByText('Sulje')).toBeNull();
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

export const PopoverWidthIsAnchoredWideAndFullBleedNarrow: StoryObj<typeof AppHeaderMenu> = {
  // Figma frames 10718:2886 (≥md) and 10718:4713 (320) — a fixed ~400px box
  // anchored under the trigger at wide viewports, full viewport width at 320.
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
    await expect(wideDropdown.getBoundingClientRect().width).toBeCloseTo(400, -1);

    await userEvent.click(trigger);

    await page.viewport(320, 640);
    const narrowDropdown = await openMenuAndGetDropdown(trigger);
    await expect(narrowDropdown.getBoundingClientRect().width).toBe(320);
    await expect(narrowDropdown.getBoundingClientRect().left).toBe(0);
  },
};

const languages = [
  { code: 'fi', label: 'FI', href: '/fi' },
  { code: 'en', label: 'EN', href: '/en' },
];

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
      search={<input aria-label="Etsi" placeholder="Etsi" />}
      actions={<LabeledIconButton icon={<CartIcon />} label="Ostoskori" />}
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
    await expect(canvas.getByRole('button', { name: 'Ostoskori' })).not.toBeNull();
    await expect(canvas.getByRole('button', { name: 'Kirjaudu' })).not.toBeNull();

    // The brand link names itself from the logo alone — concatenating an
    // arbitrary site name would make the accessible name unstable per consumer.
    const brand = canvas.getByRole('link', { name: 'Tampere' });
    await expect(brand).toHaveAttribute('href', '/');
    await expect(within(brand).queryByText('Site name')).toBeNull();
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
    const dropdown = await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));

    // The kit's floor is 24px and `sm` NavigationLinks land within a pixel
    // of it at the small breakpoints — see `languageLink`.
    await expect(
      within(dropdown).getByRole('link', { name: 'FI' }).getBoundingClientRect().height
    ).toBeGreaterThanOrEqual(24);
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
  tags: ['!dev', '!autodocs'],
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
      actions={<LabeledIconButton icon={<SearchIcon />} label="Haku" />}
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
      siteName="Site name"
      homeHref="/"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      actions={<LabeledIconButton icon={<CartIcon />} label="Ostoskori" />}
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

export const SingleRowIsTheDefault: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader
      siteName="Site name"
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      actions={<LabeledIconButton icon={<CartIcon />} label="Ostoskori" />}
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
    const actionsButton = canvas.getByRole('button', { name: 'Ostoskori' });
    const login = canvas.getByRole('button', { name: 'Kirjaudu' });
    const trigger = canvasElement.querySelector('button[class*="menuButton"]') as HTMLElement;
    const rightChildren = Array.from(rightSectionEl.children);
    const navIndex = rightChildren.indexOf(nav);
    const languageIndex = rightChildren.indexOf(languageNav);
    // The inline `actions` copy is wrapped in a div (hidden below md, shown
    // md+) now that it can move into the popover menu — the wrapper, not the
    // button itself, is rightSectionEl's direct child.
    const actionsIndex = rightChildren.indexOf(actionsButton.parentElement as HTMLElement);
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
  tags: ['!dev', '!autodocs'],
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
  tags: ['!dev', '!autodocs'],
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
  tags: ['!dev', '!autodocs'],
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

export const SingleRowSiteNameUsesSubheader: StoryObj<typeof AppHeader> = {
  render: () => (
    <AppHeader siteName="Site name" navigation={navigation} navAriaLabel="Päänavigaatio" />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');

    await page.viewport(1500, 800);
    const siteNameEl = canvasElement.querySelector('span[class*="siteName"]') as HTMLElement;

    // subheader is 20px at xl/xxl, h5 is 24px — the two layouts differ here.
    await waitFor(async () => {
      await expect(getComputedStyle(siteNameEl).fontSize).toBe('20px');
    });
  },
};

export const SiteNameIsLiftedTwoPixels: StoryObj<typeof AppHeader> = {
  tags: ['!dev', '!autodocs'],
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
      search={<input aria-label="Etsi" placeholder="Etsi" />}
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
  tags: ['!dev', '!autodocs'],
  // Right-section child order per Figma node 3898:2196 (multi-row): languages
  // -> actions -> login -> secondary logo.
  render: () => (
    <AppHeader
      layout="multi-row"
      navAriaLabel="Päänavigaatio"
      languages={languages}
      currentLanguage="fi"
      actions={<LabeledIconButton icon={<CartIcon />} label="Ostoskori" />}
      login={{ label: 'Kirjaudu', onClick: () => {} }}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(1500, 800);

    const languageNav = canvas.getByRole('navigation', { name: 'Kieli' });
    const actionsButton = canvas.getByRole('button', { name: 'Ostoskori' });
    const login = canvas.getByRole('button', { name: 'Kirjaudu' });
    const secondaryLogoEl = canvasElement.querySelector(
      'svg[class*="secondaryLogo"]'
    ) as SVGElement;

    const rightSectionEl = languageNav.parentElement as HTMLElement;
    const rightChildren = Array.from(rightSectionEl.children);
    const languageIndex = rightChildren.indexOf(languageNav);
    const actionsIndex = rightChildren.indexOf(actionsButton);
    const loginIndex = rightChildren.indexOf(login);
    const logoIndex = rightChildren.indexOf(secondaryLogoEl);

    await expect(languageIndex).toBeGreaterThanOrEqual(0);
    await expect(actionsIndex).toBeGreaterThan(languageIndex);
    await expect(loginIndex).toBeGreaterThan(actionsIndex);
    await expect(logoIndex).toBeGreaterThan(loginIndex);
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
  tags: ['!dev', '!autodocs'],
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
  tags: ['!dev', '!autodocs'],
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      actions={<LabeledIconButton icon={<CartIcon />} label="Ostoskori" />}
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
    await expect(within(dropdown).getByRole('button', { name: 'Ostoskori' })).not.toBeNull();
  },
};

export const ActionsStayInlineFromMdUp: StoryObj<typeof AppHeader> = {
  tags: ['!dev', '!autodocs'],
  // Complements ActionsMoveIntoMenuAtSmAndBelow: at md+ the inline copy is
  // the only one visible, and the popover's own copy (present whenever
  // `navigation` exists) must not also show, or the accessible name
  // "Ostoskori" would exist twice at once if the menu were ever opened.
  render: () => (
    <AppHeader
      navigation={navigation}
      navAriaLabel="Päänavigaatio"
      actions={<LabeledIconButton icon={<CartIcon />} label="Ostoskori" />}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(768, 800);
    await waitFor(async () => {
      await expect(canvas.getByRole('button', { name: 'Ostoskori' })).toBeVisible();
    });

    await openMenuAndGetDropdown(canvas.getByRole('button', { name: 'Valikko' }));
    await expect(within(document.body).getAllByRole('button', { name: 'Ostoskori' })).toHaveLength(
      1
    );
  },
};

export const ActionsStayInlineWithoutNavigation: StoryObj<typeof AppHeader> = {
  tags: ['!dev', '!autodocs'],
  // No navigation means no menu, so moving `actions` there below md would
  // strand it entirely — same reasoning as LanguagesStayVisibleWithoutNavigation.
  render: () => (
    <AppHeader
      navAriaLabel="Päänavigaatio"
      actions={<LabeledIconButton icon={<CartIcon />} label="Ostoskori" />}
    />
  ),
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const canvas = within(canvasElement);

    await page.viewport(320, 640);
    await expect(canvas.getByRole('button', { name: 'Ostoskori' })).toBeVisible();
    await expect(canvas.queryByRole('button', { name: 'Valikko' })).toBeNull();
  },
};
