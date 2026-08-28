import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import { Card } from './Card';

const meta = {
  component: Card,
  tags: ['!dev', '!autodocs'],
  args: { title: 'Otsikko', 'data-testid': 'card' },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const title = canvas.getByRole('heading', { name: 'Otsikko' });

    await expect(title.tagName).toBe('H2');
    await expect(getComputedStyle(title).color).toBe('rgb(30, 30, 34)');

    const card = canvas.getByTestId('card');
    const cardStyle = getComputedStyle(card);
    await expect(cardStyle.boxShadow).not.toBe('none');
    await expect(cardStyle.borderStyle).toBe('none');
    await expect(cardStyle.padding).toBe('0px');
  },
};

export const MediumSize: Story = {
  tags: docExample,
  args: { size: 'medium' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Otsikko' }).tagName).toBe('H3');
  },
};

export const SmallSize: Story = {
  tags: docExample,
  args: { size: 'small' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Otsikko' }).tagName).toBe('H3');
  },
};

export const MediumPaddingSmallerThanLarge: Story = {
  render: () => (
    <>
      <Card title="Suuri" size="large" data-testid="large" />
      <Card title="Pieni" size="small" data-testid="small" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const large = parseFloat(getComputedStyle(canvas.getByTestId('large')).padding);
    const small = parseFloat(getComputedStyle(canvas.getByTestId('small')).padding);

    // Card itself never carries padding (Paper's root stays `padding="none"` so
    // media can bleed to the edge) — the size-driven padding lives on the inner
    // content wrapper instead, so both should read 0px on the root.
    await expect(large).toBe(0);
    await expect(small).toBe(0);
  },
};

export const WithEyebrow: Story = {
  tags: docExample,
  args: { eyebrow: 'Lisätietoa' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Lisätietoa')).not.toBeNull();
  },
};

export const WithMediaTop: Story = {
  tags: docExample,
  args: { media: <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const media = canvas.getByRole('img');
    const mediaWrapper = media.parentElement as HTMLElement;

    await expect(getComputedStyle(mediaWrapper).padding).toBe('0px');
  },
};

export const WithMediaLeft: Story = {
  tags: docExample,
  args: {
    media: <img alt="" src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" />,
    mediaPlacement: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('card')).flexDirection).toBe('row');
  },
};

export const WithActions: Story = {
  tags: docExample,
  args: { actions: <button type="button">Lue lisää</button> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Lue lisää' });

    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

export const ActionsRemainClickable: Story = {
  args: {
    actions: (
      <button type="button" onClick={fn()}>
        Toiminto
      </button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Toiminto' });

    await userEvent.click(button);
    await expect(button).toHaveFocus();
  },
};

export const TurquoiseBackgroundUsesContrastText: Story = {
  tags: docExample,
  args: { background: 'turquoise', eyebrow: 'Lisätietoa' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByRole('heading', { name: 'Otsikko' })).color).toBe(
      'rgb(255, 255, 255)'
    );
    await expect(getComputedStyle(canvas.getByText('Lisätietoa')).color).toBe('rgb(255, 255, 255)');
  },
};
