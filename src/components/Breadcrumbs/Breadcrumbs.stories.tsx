import type { Meta, StoryObj } from '@storybook/react-vite';
import { Breadcrumbs, type Breadcrumb } from './Breadcrumbs';

const meta: Meta<typeof Breadcrumbs> = {
  argTypes: {
    items: { control: 'object', description: 'Array of breadcrumb items { label, href?, linkComponent? }' },
    isMobile: { control: 'boolean', description: 'Render mobile condensed view' },
    ariaLabel: { control: 'text', description: 'Accessible label for the breadcrumb nav' },
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
  { label: 'current' },
];

export const Default: Story = {
  args: {
    items,
  },
};

export const Mobile: Story = {
  args: {
    items,
    isMobile: true,
    ariaLabel: 'Breadcrumb',
  },
};
