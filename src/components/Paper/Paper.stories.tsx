import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Paper } from './Paper';

const meta = {
  component: Paper,
  tags: ['!dev', '!autodocs'],
  args: { 'data-testid': 'paper' },
} satisfies Meta<typeof Paper>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paper = canvas.getByTestId('paper');
    const style = getComputedStyle(paper);

    await expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(style.borderRadius).toBe('0px');
    await expect(style.borderStyle).toBe('none');
    await expect(style.boxShadow).not.toBe('none');
  },
};

export const NoShadow: Story = {
  tags: docExample,
  args: { withShadow: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('paper')).boxShadow).toBe('none');
  },
};

export const TurquoiseBackground: Story = {
  tags: docExample,
  args: { background: 'turquoise' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('paper')).backgroundColor).toBe(
      'rgb(0, 116, 164)'
    );
  },
};

export const BlueBackground: Story = {
  tags: docExample,
  args: { background: 'blue' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('paper')).backgroundColor).toBe(
      'rgb(34, 67, 123)'
    );
  },
};

export const PinkBackground: Story = {
  tags: docExample,
  args: { background: 'pink' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('paper')).backgroundColor).toBe(
      'rgb(173, 57, 99)'
    );
  },
};

export const PillRadius: Story = {
  tags: docExample,
  args: { radius: 'pill' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('paper')).borderRadius).toBe('9999px');
  },
};

export const WithBorder: Story = {
  tags: docExample,
  args: { withBorder: true, withShadow: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const style = getComputedStyle(canvas.getByTestId('paper'));

    await expect(style.borderStyle).toBe('solid');
    await expect(style.borderWidth).toBe('2px');
    await expect(style.borderColor).toBe('rgb(222, 222, 226)');
    await expect(style.boxShadow).toBe('none');
  },
};

export const WithBorderBrandColor: Story = {
  tags: docExample,
  args: { withBorder: true, withShadow: false, borderColor: 'brand' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('paper')).borderColor).toBe(
      'rgb(41, 84, 154)'
    );
  },
};

export const WithBorderAndShadow: Story = {
  // Both default to on independently — verifies they don't clobber each other
  // when combined, unlike the docs-visible stories above which each isolate
  // one by explicitly turning the other off.
  args: { withBorder: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const style = getComputedStyle(canvas.getByTestId('paper'));

    await expect(style.borderStyle).toBe('solid');
    await expect(style.boxShadow).not.toBe('none');
  },
};

export const CustomClassNameIsPreserved: Story = {
  args: { className: 'consumer-custom-class' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('paper').className).toContain('consumer-custom-class');
  },
};

// Hidden test-only stories below — pure regression checks, no unique visual
// state beyond what the docs-visible stories above already show.

export const NoPadding: Story = {
  args: { padding: 'none' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('paper')).padding).toBe('0px');
  },
};

export const PaddingMediumExceedsSmall: Story = {
  render: () => (
    <>
      <Paper padding="sm" data-testid="small" />
      <Paper padding="md" data-testid="medium" />
      <Paper padding="lg" data-testid="large" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const small = parseFloat(getComputedStyle(canvas.getByTestId('small')).padding);
    const medium = parseFloat(getComputedStyle(canvas.getByTestId('medium')).padding);
    const large = parseFloat(getComputedStyle(canvas.getByTestId('large')).padding);

    await expect(small).toBeLessThan(medium);
    await expect(medium).toBeLessThan(large);
  },
};

export const PolymorphicComponent: Story = {
  render: () => <Paper component="section" data-testid="paper" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('paper').tagName).toBe('SECTION');
  },
};

// ── Dev-warning tests (verifies the console.error guards in Paper.tsx) ───────

// Captures console.error calls for the dev-warning tests below.
let capturedConsoleErrors: string[] = [];

const captureConsoleErrors = () => {
  capturedConsoleErrors = [];
  const original = console.error;
  console.error = (...messageArgs: unknown[]) => {
    capturedConsoleErrors.push(String(messageArgs[0]));
  };
  return () => {
    console.error = original;
  };
};

export const WarnsOnInvalidBackground: Story = {
  // `as any` simulates a non-TS consumer (or an `as any` escape hatch) passing
  // a value outside the documented union — must warn rather than silently
  // rendering with no background class at all.
  args: { background: 'invalid' as never },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /invalid `background` value/.test(m))).toBe(true)
    );
  },
};

export const WarnsOnInvalidPadding: Story = {
  args: { padding: 'invalid' as never },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /invalid `padding` value/.test(m))).toBe(true)
    );
  },
};

export const WarnsOnInvalidBorderColor: Story = {
  // Only checked when `withBorder` is set — an invalid `borderColor` with no
  // border on screen has nothing to warn about.
  args: { withBorder: true, borderColor: 'invalid' as never },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /invalid `borderColor` value/.test(m))).toBe(true)
    );
  },
};
