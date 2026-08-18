import { Box, Flex } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { IconButton } from './IconButton';
import { SearchIcon } from '../../icons/SearchIcon';
import { vars } from '../../theme';

const meta = {
  argTypes: {
    children: { control: 'text' },
    variant: { control: { type: 'select' }, options: ['default', 'inverted'] },
    size: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
    'aria-label': { control: 'text' },
  },
  args: {
    children: '<Icon />',
    variant: 'default',
    size: 'md',
    disabled: false,
    'aria-label': 'Search',
  },
  component: IconButton,
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <IconButton size="md" {...args} variant="default">
      <SearchIcon fill="black" />
    </IconButton>
  ),
};

export const Inverted: Story = {
  render: (args) => (
    <Box style={{ backgroundColor: vars.brand.blue.mainDark, width: 'fit-content' }}>
      <IconButton size="md" {...args} variant="inverted">
        <SearchIcon fill="white" />
      </IconButton>
    </Box>
  ),
};

export const Disabled: Story = {
  render: (args) => (
    <IconButton size="md" {...args} variant="inverted" disabled>
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
  // Backgrounds match Figma's Icon-button "Colored" reference frame exactly
  // (node 13574:322): Blue/500, Turquoise/200, Green/500, Red/200 — not
  // arbitrary CSS color keywords.
  render: (args) => (
    <Flex>
      <Box style={{ background: vars.primitives.colors.blue['500'], padding: '1rem' }}>
        <IconButton size="md" {...args} variant="inverted">
          <SearchIcon fill="white" />
        </IconButton>
      </Box>
      <Box style={{ background: vars.primitives.colors.turquoise['200'], padding: '1rem' }}>
        <IconButton size="md" {...args} variant="inverted">
          <SearchIcon fill="white" />
        </IconButton>
      </Box>
      <Box style={{ background: vars.primitives.colors.green['500'], padding: '1rem' }}>
        <IconButton size="md" {...args} variant="inverted">
          <SearchIcon fill="white" />
        </IconButton>
      </Box>
      <Box style={{ background: vars.primitives.colors.red['200'], padding: '1rem' }}>
        <IconButton size="md" {...args} variant="inverted">
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
    <IconButton {...args} size="sm" variant="inverted">
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
    <IconButton {...args} size="xs" variant="inverted">
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
    <IconButton {...args} size="lg" variant="inverted">
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
    <IconButton {...args} size="xs" variant="inverted">
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
    <IconButton {...args} size="lg" variant="inverted">
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

export const FocusVisibleHasBackgroundAndOutline: Story = {
  tags: ['!dev', '!autodocs'],
  // Figma's Focus state binds both an outline AND the same background
  // overlay used by Hover/Active — verified against the live design file
  // for #90 (contradicts the outline-only assumption in the earlier design
  // doc).
  render: (args) => (
    <IconButton {...args} size="md" variant="default">
      <SearchIcon fill="black" />
    </IconButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    button.focus();
    const style = getComputedStyle(button);
    await expect(style.outlineStyle).toBe('solid');
    // Figma Background/Hover|Focus|Active = #f7f7f9 = colors.neutral['50']
    // (iconButton.states.overlay) — exact match, not just "some color", so a
    // future swap of the default/inverted overlay tokens would fail this test.
    await expect(style.backgroundColor).toBe('rgb(247, 247, 249)');
  },
};

export const DisabledDoesNotShowHoverBackground: Story = {
  tags: ['!dev', '!autodocs'],
  // A disabled <button> still matches the CSS `:hover` pseudo-class in this
  // project's Chromium test environment (a widely-known cross-browser CSS
  // behavior, but only Chromium is exercised by this suite) — only pointer
  // *events* are suppressed, not the pseudo-class — so `stateBlock()`'s
  // `:disabled` selector must explicitly reset `background: 'none'` or a
  // hovered disabled button would incorrectly paint the hover overlay. Uses
  // `userEvent.hover()` as a best-effort
  // trigger — it doesn't reliably simulate real OS-level `:hover` in this
  // repo's Playwright/Chromium test environment, but the assertion below is
  // on the CSS rule itself (no background at all on `:disabled`), which
  // holds regardless of whether `:hover` is also active.
  render: (args) => (
    <IconButton {...args} size="md" variant="default" disabled>
      <SearchIcon fill="black" />
    </IconButton>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    await userEvent.hover(button);
    const style = getComputedStyle(button);
    await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  },
};
