import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import { Card } from './Card';
import { Button } from '../Button';
import { Typography } from '../Typography';
import { TextLink } from '../TextLink';

const meta = {
  component: Card,
  tags: ['!dev', '!autodocs'],
  args: {
    title: 'Otsikko',
    'data-testid': 'card',
    children: <Typography variant="p1">Kuvaava teksti</Typography>,
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

// A 1x1 GIF has no real intrinsic size, so it can't catch the media wrapper
// collapsing to 0 height in the default (column) layout — this SVG has real
// width/height and stands in for a real photo in that regression check.
const sizedMediaImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="260" height="195"><rect width="260" height="195" fill="#ccc"/></svg>'
)}`;

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
  args: { size: 'small' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Otsikko' }).tagName).toBe('H3');
  },
};

export const RootHasNoPadding: Story = {
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

export const PaddingScalesWithSize: Story = {
  render: () => (
    <>
      <Card title="Suuri" size="large" />
      <Card title="Keskikokoinen" size="medium" />
      <Card title="Pieni" size="small" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [large, medium, small] = canvas
      .getAllByTestId('card-content')
      .map((el) => parseFloat(getComputedStyle(el).padding));

    await expect(small).toBeLessThan(medium);
    await expect(medium).toBeLessThan(large);
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
  args: { media: <img alt="" src={sizedMediaImage} /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const media = canvas.getByRole('img');
    const mediaWrapper = media.parentElement as HTMLElement;

    await expect(getComputedStyle(mediaWrapper).padding).toBe('0px');
    // Regression: the wrapper must size to the image, not collapse to 0 height
    // in the default column layout (only the `left` row layout should split
    // the wrapper 50/50 with `content` via `flex: 1 0 0`).
    await expect(mediaWrapper.getBoundingClientRect().height).toBeGreaterThanOrEqual(190);
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
  args: { actions: <Button variant="secondary">Lue lisää</Button> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Lue lisää' });

    await userEvent.tab();
    await expect(button).toHaveFocus();
  },
};

const handleActionsClick = fn();

export const ActionsRemainClickable: Story = {
  args: {
    actions: (
      <Button variant="secondary" onClick={handleActionsClick}>
        Toiminto
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Toiminto' });

    await userEvent.click(button);
    await expect(handleActionsClick).toHaveBeenCalledOnce();
    await expect(button).toHaveFocus();
  },
};

export const WithInlineTextLink: Story = {
  tags: docExample,
  args: {
    children: (
      <>
        <Typography variant="p1">Kuvaava teksti</Typography>
        <TextLink href="#">Lue lisää</TextLink>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Lue lisää' });

    await expect(link).toHaveAttribute('href', '#');
  },
};

export const WithExternalTextLink: Story = {
  args: {
    children: (
      <>
        <Typography variant="p1">Kuvaava teksti</Typography>
        <TextLink href="https://tampere.fi" openExternal>
          Tampereen verkkosivut
        </TextLink>
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAttribute('target', '_blank');
  },
};

export const TurquoiseBackgroundTextLinkUsesContrastText: Story = {
  args: {
    background: 'turquoise',
    children: <TextLink href="#">Lue lisää</TextLink>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByRole('link')).color).toBe('rgb(255, 255, 255)');
  },
};

export const TurquoiseBackgroundButtonInChildrenKeepsOwnColors: Story = {
  args: {
    background: 'turquoise',
    children: <Button variant="secondary">Toiminto</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Unlike Typography/TextLink, a Button nested in `children` must keep its
    // own color pairing rather than being force-inverted along with the rest
    // of the text block — this is the same guarantee `actions` already has.
    await expect(getComputedStyle(canvas.getByRole('button')).color).not.toBe('rgb(255, 255, 255)');
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
    // `children` is arbitrary consumer content, not something Card renders itself —
    // this must also flip to contrast color, not just the eyebrow/title Card owns.
    await expect(getComputedStyle(canvas.getByText('Kuvaava teksti')).color).toBe(
      'rgb(255, 255, 255)'
    );
  },
};
