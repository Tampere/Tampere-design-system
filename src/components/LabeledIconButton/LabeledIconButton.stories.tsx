import { within, userEvent } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Box, Flex as MantineFlex } from '@mantine/core';
import { LabeledIconButton } from './LabeledIconButton';
import { AddIcon } from '../../icons/AddIcon';

const meta = {
  argTypes: {
    icon: { control: false },
    label: { control: 'text' },
    variant: { control: { type: 'select' }, options: ['light', 'dark'] },
    disabled: { control: 'boolean' },
  },
  args: {
    icon: <AddIcon />,
    label: 'Label',
    // 'dark' so the Default story is legible against Storybook's default
    // light canvas background (see LabeledIconButton.tsx: the 'light' variant
    // is meant for use on dark/colored surfaces) — Task 8 previously
    // hardcoded `variant="dark"` directly in Default's render function
    // instead, which made the Controls panel's variant selector inert for
    // that story. Setting it here keeps Controls live.
    variant: 'dark',
    disabled: false,
  },
  component: LabeledIconButton,
} satisfies Meta<typeof LabeledIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} />,
};

export const Disabled: Story = {
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    await expect(button).toBeDisabled();
  },
};

export const Dark: Story = {
  render: (args) => (
    <Box style={{ backgroundColor: 'grey', width: 'fit-content', padding: '1rem' }}>
      <LabeledIconButton {...args} variant="dark" icon={<AddIcon />} />
    </Box>
  ),
};

export const Colored: Story = {
  render: (args) => (
    // Demos the 'light' variant specifically (legible against saturated
    // backgrounds) — explicit here since `meta.args.variant` defaults to
    // 'dark' (see Default's comment above).
    <MantineFlex gap="md">
      <Box style={{ background: 'red', padding: '1rem' }}>
        <LabeledIconButton {...args} icon={<AddIcon />} variant="light" />
      </Box>
      <Box style={{ background: 'green', padding: '1rem' }}>
        <LabeledIconButton {...args} icon={<AddIcon />} variant="light" />
      </Box>
      <Box style={{ background: 'blue', padding: '1rem' }}>
        <LabeledIconButton {...args} icon={<AddIcon />} variant="light" />
      </Box>
    </MantineFlex>
  ),
};

export const RendersLabelText: Story = {
  tags: ['!dev', '!autodocs'],
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} label="Favorite" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Favorite')).toBeInTheDocument();
  },
};

export const InteractionAppliesBackgroundAndColor: Story = {
  tags: ['!dev', '!autodocs'],
  /**
   * Verifies that the background overlay applies during a `userEvent.pointer()`
   * mouse-down press. This exercises `:focus-visible`, not `:active`:
   * `@testing-library/user-event` calls `focus.focusElement(target)` internally
   * as part of simulating a pointer press, which focuses the button and
   * triggers `:focus-visible` before/instead of a genuine `:active` state.
   * That makes this story a near-duplicate of
   * `FocusVisibleHasBackgroundAndOutline` below, and leaves real
   * `:hover`/`:active` coverage as a known gap — `userEvent.hover()` does not
   * reliably trigger the real `:hover` pseudo-class in this repo's
   * Playwright/Chromium test environment (synthetic pointer events don't move
   * the OS cursor), and simulating genuine `:active` (mouse held down without
   * moving focus) isn't currently exercised either. Kept as-is rather than
   * removed since it still asserts the background-overlay behavior end to end
   * via a different interaction path than the sibling focus-visible story.
   */
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} variant="dark" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    await userEvent.pointer({ keys: '[MouseLeft>]', target: button });
    const style = getComputedStyle(button);
    // Figma Background/Hover|Focus|Active = #f7f7f9 = colors.neutral['50']
    // (iconButton.states.overlay, dark variant) — exact match rather than
    // "some color", so a light/dark overlay-token swap fails this test.
    await expect(style.backgroundColor).toBe('rgb(247, 247, 249)');
  },
};

export const FocusVisibleHasBackgroundAndOutline: Story = {
  tags: ['!dev', '!autodocs'],
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} variant="dark" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    button.focus();
    const style = getComputedStyle(button);
    await expect(style.outlineStyle).toBe('solid');
    // Figma Background/Hover|Focus|Active = #f7f7f9 = colors.neutral['50']
    // (iconButton.states.overlay, dark variant) — exact match.
    await expect(style.backgroundColor).toBe('rgb(247, 247, 249)');
    // `color` is untested elsewhere on LabeledIconButton — dark variant focus
    // foreground = iconButton.states.focus = colors.neutral['500'] (#686872).
    await expect(style.color).toBe('rgb(104, 104, 114)');
  },
};

export const MeetsTouchTarget: Story = {
  tags: ['!dev', '!autodocs'],
  // Icon + label + padding inherently exceed the 24px AA floor; no min-size needed.
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    const { width, height } = getComputedStyle(button);
    await expect(parseFloat(width)).toBeGreaterThanOrEqual(24);
    await expect(parseFloat(height)).toBeGreaterThanOrEqual(24);
  },
};

export const LightVariantFocusVisibleHasBackground: Story = {
  tags: ['!dev', '!autodocs'],
  // All of the interactive-state stories above exercise `variant="dark"`
  // only — the entire `light` variant (`iconButtonBackground.light` =
  // rgba(255,255,255,0.1), `iconButtonForeground.light.*`) previously had no
  // interactive-state coverage at all. Rendered against a dark-ish backdrop
  // so the (semi-transparent white) overlay is meaningful, mirroring the
  // `Dark`/`Colored` stories' pattern above.
  render: (args) => (
    <Box style={{ backgroundColor: 'grey', width: 'fit-content', padding: '1rem' }}>
      <LabeledIconButton {...args} icon={<AddIcon />} variant="light" />
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    button.focus();
    const style = getComputedStyle(button);
    await expect(style.outlineStyle).toBe('solid');
    // iconButtonBackground.light = hover.overlayContrast = rgba(255, 255,
    // 255, 0.1) — `background-color` reports the declared (uncomposited)
    // rgba value, not a value composited against the backdrop, so this is
    // an exact match rather than "some color".
    await expect(style.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
    // `color` is untested elsewhere on the light/contrast variant — light
    // variant focus foreground = iconButton.states.contrast.focus =
    // colors.neutral['100'] (#f2f2f4).
    await expect(style.color).toBe('rgb(242, 242, 244)');
  },
};

export const IconMatchesSizeToken: Story = {
  tags: ['!dev', '!autodocs'],
  // The rendered icon must be sized from components.icon.size.large (Figma:
  // 24px) via the `globalStyle('${iconWrapper} svg', ...)` rule — mirrors the
  // per-size token-matching tests in IconButton.stories.tsx (e.g.
  // `LargeSizeIconMatchesToken`), which LabeledIconButton previously lacked
  // entirely.
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const svg = canvas.getByRole('button').querySelector('svg') as SVGElement;
    await expect(svg).toBeTruthy();
    const { width, height } = getComputedStyle(svg);
    await expect(width).toBe('24px');
    await expect(height).toBe('24px');
  },
};

export const DisabledDoesNotShowHoverBackground: Story = {
  tags: ['!dev', '!autodocs'],
  // A disabled <button> still matches the CSS `:hover` pseudo-class in this
  // project's Chromium test environment (a widely-known cross-browser CSS
  // behavior, but only Chromium is exercised by this suite) — only pointer
  // *events* are suppressed, not the pseudo-class — so `variantStyle()`'s
  // `:disabled` selector must explicitly
  // reset `background: 'none'` or a hovered disabled button would incorrectly
  // paint the hover overlay. Uses `userEvent.hover()` as a best-effort
  // trigger — see the docblock on `InteractionAppliesBackgroundAndColor`
  // above for why real `:hover` isn't reliably reproduced in this repo's
  // Playwright/Chromium environment — but the assertion is on the CSS rule
  // itself (no background at all on `:disabled`), which holds regardless.
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} variant="dark" disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    await userEvent.hover(button);
    const style = getComputedStyle(button);
    await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  },
};
