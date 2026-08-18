import { Box, Flex } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { IconButton } from './IconButton';
import { SearchIcon } from '../../icons/SearchIcon';

const meta = {
  argTypes: {
    children: { control: 'text' },
    variant: { control: 'text' },
    size: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
    'aria-label': { control: 'text' },
  },
  args: {
    children: '<Icon />',
    variant: 'light',
    size: 'md',
    disabled: false,
    'aria-label': 'Search',
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
    const button = canvas.getByRole('button', { name: 'Search' });
    await expect(button).toBeInTheDocument();
    const path = button.querySelector('path') as SVGPathElement;
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

export const ExtraSmallSizeIconMatchesToken: Story = {
  // Test-only: carries a `play` assertion, not documentation, so it's hidden
  // from the sidebar (`!dev`) and autodocs page (`!autodocs`).
  tags: ['!dev', '!autodocs'],
  // The rendered icon inside an "xs" IconButton must be sized from
  // components.icon.size.extraSmall (Figma: 16px), not fall back to the raw
  // icon's own default size for lack of a data-size="xs" style rule.
  render: (args) => (
    <IconButton {...args} size="xs" variant="light">
      <SearchIcon fill="black" />
    </IconButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole('button').querySelector('svg') as SVGElement;
    await expect(svg).toBeTruthy();
    const width = getComputedStyle(svg).width;
    await expect(width).toBe('16px');
  },
};

export const LargeSizeIconMatchesToken: Story = {
  // Test-only: carries a `play` assertion, not documentation, so it's hidden
  // from the sidebar (`!dev`) and autodocs page (`!autodocs`).
  tags: ['!dev', '!autodocs'],
  // The rendered icon inside a "lg" IconButton must be square, sized from
  // components.icon.size.large (Figma: 24px) on both axes — not stretched by
  // pairing a mismatched height token.
  render: (args) => (
    <IconButton {...args} size="lg" variant="light">
      <SearchIcon fill="black" />
    </IconButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole('button').querySelector('svg') as SVGElement;
    await expect(svg).toBeTruthy();
    const { width, height } = getComputedStyle(svg);
    await expect(width).toBe('24px');
    await expect(height).toBe('24px');
  },
};

export const ExtraSmallSizeMeetsTouchTarget: Story = {
  tags: ['!dev', '!autodocs'],
  // WCAG 2.2 AA (SC 2.5.8): the rendered button box must be >= 24x24 CSS px
  // even though the "xs" glyph itself is only 16px.
  render: (args) => (
    <IconButton {...args} size="xs" variant="light">
      <SearchIcon fill="black" />
    </IconButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    const { width, height } = getComputedStyle(button);
    await expect(parseFloat(width)).toBeGreaterThanOrEqual(24);
    await expect(parseFloat(height)).toBeGreaterThanOrEqual(24);
  },
};

export const LargeSizeGrowsPastTouchTarget: Story = {
  tags: ['!dev', '!autodocs'],
  // "lg" (24px glyph + 2x2px padding = 28px) must render at 28x28, not be
  // clamped down to the 24px floor.
  render: (args) => (
    <IconButton {...args} size="lg" variant="light">
      <SearchIcon fill="black" />
    </IconButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    const { width, height } = getComputedStyle(button);
    await expect(width).toBe('28px');
    await expect(height).toBe('28px');
  },
};
