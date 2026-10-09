import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { Breadcrumbs, type Breadcrumb } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of breadcrumb items { label, href?, linkComponent? }',
    },
    isMobile: {
      control: 'boolean',
      description: 'Render mobile condensed view',
    },
    ariaLabel: {
      control: 'text',
      description: 'Accessible label for the breadcrumb nav',
    },
  },
  args: {
    items: [],
  },
  component: Breadcrumbs,
};

export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

function Link({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <a className={className} href="/">
      {children}
    </a>
  );
}

const items: Breadcrumb[] = [
  { label: 'Home', linkComponent: (props) => <Link {...props} /> },
  { label: 'Library (default)', href: '/' },
  {
    label: 'Data (default)',
    href: '/',
    linkComponent: (props) => <Link {...props} />,
  },
  {
    label: 'Previous',
    href: '/',
    linkComponent: (props) => <Link {...props} />,
  },
  { label: 'current', href: '/' },
];

export const Default: Story = {
  args: {
    items,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const nav = canvas.getByRole('navigation', { name: 'Murupolku' });

    // 1. Navigation has a default accessible name.
    await expect(nav).toHaveAttribute('aria-label', 'Murupolku');

    // 2. Current page is marked and isn't a link or a tab stop.
    const currentPage = within(nav).getByText('current');
    await expect(currentPage).toHaveAttribute('aria-current', 'page');
    await expect(currentPage).not.toHaveAttribute('href');
    await expect(currentPage).not.toHaveAttribute('tabindex');
    await expect(currentPage.tagName).not.toBe('A');

    // 3. Separators are hidden from assistive technology.
    const separators = Array.from(nav.querySelectorAll('span')).filter(
      (element) => element.textContent?.trim() === '›'
    );

    await expect(separators.length).toBeGreaterThan(0);

    for (const separator of separators) {
      await expect(separator).toHaveAttribute('aria-hidden', 'true');
    }
  },
};

export const Mobile: Story = {
  args: {
    items,
    isMobile: true,
    ariaLabel: 'Breadcrumb',
  },
};
