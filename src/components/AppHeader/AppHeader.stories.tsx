import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { AppHeaderNav } from './AppHeaderNav';
import { AppHeaderDrawer } from './AppHeaderDrawer';
import { AppHeader } from './AppHeader';

const navigation = [
  { label: 'Palvelut', href: '/palvelut' },
  { label: 'Asiointi', href: '/asiointi', isSelected: true },
  { label: 'Yhteystiedot', href: '/yhteystiedot' },
];

const meta = {
  component: AppHeaderNav,
  tags: ['!dev', '!autodocs'],
} satisfies Meta<typeof AppHeaderNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const NavRendersLabelledLandmark: Story = {
  args: { items: navigation, ariaLabel: 'Päänavigaatio' },
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
    const canvas = within(canvasElement);

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

export const LanguagesAreOptional: StoryObj<typeof AppHeader> = {
  render: () => <AppHeader navigation={navigation} navAriaLabel="Päänavigaatio" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('banner')).not.toBeNull();
    await expect(canvas.queryByRole('navigation', { name: 'Kieli' })).toBeNull();
    await expect(canvas.getByRole('link', { name: 'Tampere' })).toHaveAttribute('href', '/');
  },
};
