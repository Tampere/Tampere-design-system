import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { AppHeaderNav } from './AppHeaderNav';
import { AppHeaderDrawer } from './AppHeaderDrawer';

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
