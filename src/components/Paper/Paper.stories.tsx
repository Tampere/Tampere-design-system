import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Paper } from './Paper';

const meta = {
  component: Paper,
  tags: ['!dev', '!autodocs'],
  args: { children: 'Paperi' },
} satisfies Meta<typeof Paper>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paper = canvas.getByText('Paperi');
    const style = getComputedStyle(paper);

    await expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(style.borderRadius).toBe('0px');
    await expect(style.borderStyle).toBe('none');
    await expect(style.boxShadow).toBe('none');
  },
};

export const InvertedBackground: Story = {
  tags: docExample,
  args: { background: 'inverted' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paper = canvas.getByText('Paperi');

    await expect(getComputedStyle(paper).backgroundColor).toBe('rgb(0, 116, 164)');
  },
};

export const PillRadius: Story = {
  tags: docExample,
  args: { radius: 'pill' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paper = canvas.getByText('Paperi');

    await expect(getComputedStyle(paper).borderRadius).toBe('9999px');
  },
};

export const WithBorder: Story = {
  tags: docExample,
  args: { withBorder: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paper = canvas.getByText('Paperi');
    const style = getComputedStyle(paper);

    await expect(style.borderStyle).toBe('solid');
    await expect(style.borderWidth).toBe('2px');
    await expect(style.borderColor).toBe('rgb(222, 222, 226)');
  },
};

export const WithShadow: Story = {
  tags: docExample,
  args: { withShadow: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paper = canvas.getByText('Paperi');

    await expect(getComputedStyle(paper).boxShadow).not.toBe('none');
  },
};

// Hidden test-only stories below — pure regression checks, no unique visual
// state beyond what the docs-visible stories above already show.

export const PaddingScalesSmallToLarge: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const small = getComputedStyle(canvas.getByText('Paperi'));
    await expect(parseFloat(small.padding)).toBeGreaterThan(0);
  },
};

export const PaddingMediumExceedsSmall: Story = {
  render: () => (
    <>
      <Paper padding="small" data-testid="small">
        Pieni
      </Paper>
      <Paper padding="medium" data-testid="medium">
        Keski
      </Paper>
      <Paper padding="large" data-testid="large">
        Suuri
      </Paper>
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
  render: () => <Paper component="section">Paperi</Paper>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const paper = canvas.getByText('Paperi');

    await expect(paper.tagName).toBe('SECTION');
  },
};
