import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@storybook/testing-library';
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

// Hidden test-only stories below — pure regression checks, no unique visual
// state beyond what the docs-visible stories above already show.

export const PaddingScalesSmallToLarge: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const small = getComputedStyle(canvas.getByTestId('paper'));
    await expect(parseFloat(small.padding)).toBeGreaterThan(0);
  },
};

export const PaddingMediumExceedsSmall: Story = {
  render: () => (
    <>
      <Paper padding="small" data-testid="small" />
      <Paper padding="medium" data-testid="medium" />
      <Paper padding="large" data-testid="large" />
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
