import { Box, Flex } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { IconButton } from './IconButton';
import { SearchIcon } from '../../icons/SearchIcon';
import { themeVariables } from '../../theme/themeVariables';
import { rem } from '@mantine/core';

const meta = {
  argTypes: {
    children: { control: 'text' },
    variant: { control: 'text' },
    size: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  args: {
    children: '<Icon />',
    variant: 'light',
    size: 'md',
    disabled: false,
  },
  component: IconButton,
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
  render: (args) => (
    <Box style={{ backgroundColor: 'grey', width: 'fit-content' }}>
      <IconButton variant="dark" size="md" {...args}>
        <SearchIcon fill="white" />
      </IconButton>
    </Box>
  ),
};

export const Light: Story = {
  render: (args) => (
    <IconButton variant="light" size="md" {...args}>
      <SearchIcon fill="black" />
    </IconButton>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <IconButton variant="light" size="md" {...args} disabled>
      <SearchIcon fill="gray" />
    </IconButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const path = canvas.getByRole('button').querySelector('path') as SVGPathElement;
    await expect(path).toBeTruthy();
    // Figma Components/Icon-button/Contrast/Disabled = Neutral/400 (#9999a0),
    // not Neutral/300 (#c9c9ce).
    await expect(getComputedStyle(path).fill).toBe('rgb(153, 153, 160)');
  },
};

export const Colored: Story = {
  render: (args) => (
    <Flex>
      <Box style={{ background: 'red', padding: '1rem' }}>
        <IconButton variant="light" size="md" {...args}>
          <SearchIcon fill="white" />
        </IconButton>
      </Box>
      <Box style={{ background: 'green', padding: '1rem' }}>
        <IconButton variant="light" size="md" {...args}>
          <SearchIcon fill="white" />
        </IconButton>
      </Box>
      <Box style={{ background: 'blue', padding: '1rem' }}>
        <IconButton variant="light" size="md" {...args}>
          <SearchIcon fill="white" />
        </IconButton>
      </Box>
    </Flex>
  ),
};

export const SmallSizeIconMatchesToken: Story = {
  // Test-only: carries a `play` assertion, not documentation, so it's hidden
  // from the sidebar (`!dev`) and autodocs page (`!autodocs`).
  tags: ['!dev', '!autodocs'],
  // The rendered icon inside a "sm" IconButton must be sized from
  // components.icon.size.small (Figma: 18px), not a stale 16px value.
  render: (args) => (
    <IconButton {...args} size="sm" variant="light">
      <SearchIcon fill="black" />
    </IconButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole('button').querySelector('svg') as SVGElement;
    await expect(svg).toBeTruthy();
    const width = getComputedStyle(svg).width;
    await expect(width).toBe('18px');
  },
};

export const ExtraSmallIconTokenMatchesFigma: Story = {
  // Test-only: carries a `play` assertion, not documentation, so it's hidden
  // from the sidebar (`!dev`) and autodocs page (`!autodocs`).
  tags: ['!dev', '!autodocs'],
  // components.icon.size.extraSmall has no rendered consumer yet (no
  // IconButton "xs" variant exists), so this is a direct token-value check
  // rather than a DOM assertion.
  render: (args) => <IconButton {...args} size="md" variant="light" />,
  play: async () => {
    await expect(themeVariables.components.icon.size.extraSmall).toBe(rem('16px'));
  },
};
