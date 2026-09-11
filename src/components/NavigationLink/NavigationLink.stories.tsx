import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationLink } from './NavigationLink';
import { Flex, Stack } from '@mantine/core';
import { within, expect } from 'storybook/test';

const meta = {
  component: NavigationLink,
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: 'Whether the link is in a selected/active state',
    },
    href: {
      control: 'text',
      description: 'Link destination URL',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'inverted'],
      description: 'Visual variant of the link',
    },
    size: {
      control: { type: 'select' },
      options: ['md', 'sm'],
      description: 'Size of the link',
    },
    children: { control: 'text', description: 'Link text or children' },
    onClick: { action: 'clicked' },
  },
  args: {
    href: '#',
    children: 'Navigointilinkki',
    isSelected: false,
    variant: 'default',
    size: 'md',
  },
} satisfies Meta<typeof NavigationLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: '#',
    children: 'Navigointilinkki',
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    href: '#',
    children: 'Navigointilinkki',
    isSelected: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <Stack gap="lg">
      <Flex gap="xl">
        <Stack gap="md">
          <h3>Medium</h3>
          <NavigationLink href="#">Navigointilinkki</NavigationLink>
          <NavigationLink href="#" isSelected>
            Navigointilinkki
          </NavigationLink>
        </Stack>

        <Stack gap="md">
          <h3>Small</h3>
          <NavigationLink href="#" size="sm">
            Navigointilinkki
          </NavigationLink>
          <NavigationLink href="#" size="sm" isSelected>
            Navigointilinkki
          </NavigationLink>
        </Stack>
      </Flex>

      <div style={{ background: '#0056A6', padding: '20px' }}>
        <h3 style={{ color: 'white' }}>Inverted Color</h3>
        <Flex gap="xl">
          <NavigationLink href="#" variant="inverted">
            Navigointilinkki
          </NavigationLink>
          <NavigationLink href="#" isSelected variant="inverted">
            Navigointilinkki
          </NavigationLink>
        </Flex>
      </div>
    </Stack>
  ),
};

export const WithCustomLink: Story = {
  render: () => (
    <Stack gap="md">
      <h3>With Custom Component as Link</h3>
      <NavigationLink
        renderLink={(className) => {
          return (
            <a href="#custom" className={className}>
              Custom Link Component
            </a>
          );
        }}
      />
      <NavigationLink
        isSelected
        renderLink={(className) => (
          <a href="#custom-selected" className={className}>
            Selected Custom Link
          </a>
        )}
      />
      <div style={{ background: '#0056A6', padding: '20px' }}>
        <NavigationLink
          variant="inverted"
          renderLink={(className) => {
            return (
              <a href="#custom-selected" className={className}>
                Inverted custom children
              </a>
            );
          }}
        ></NavigationLink>
      </div>
    </Stack>
  ),
};

export const SelectedSetsAriaCurrentPage: Story = {
  args: { isSelected: true, href: '#', children: 'Navigointilinkki' },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Navigointilinkki' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};

export const UnselectedHasNoAriaCurrent: Story = {
  args: { isSelected: false, href: '#', children: 'Navigointilinkki' },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Absent entirely, not `aria-current="false"` — the false string is
    // exposed to AT as a real value and would announce every link as current.
    await expect(canvas.getByRole('link', { name: 'Navigointilinkki' })).not.toHaveAttribute(
      'aria-current'
    );
  },
};

export const ExplicitAriaCurrentWins: Story = {
  args: { isSelected: true, href: '#', children: 'Navigointilinkki', 'aria-current': 'step' },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Navigointilinkki' })).toHaveAttribute(
      'aria-current',
      'step'
    );
  },
};

export const RenderLinkReceivesDerivedAriaCurrent: Story = {
  args: {
    isSelected: true,
    children: 'Navigointilinkki',
    renderLink: (className: string, ariaCurrent) => (
      <a className={className} href="#" aria-current={ariaCurrent}>
        Navigointilinkki
      </a>
    ),
  },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Navigointilinkki' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};
