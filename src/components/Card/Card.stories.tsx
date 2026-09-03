import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import { Card } from './Card';
import { Button } from '../Button';
import { Typography } from '../Typography';
import { TextLink } from '../TextLink';
import { Chip } from '../Chip';

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
  args: { size: 'md' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Otsikko' }).tagName).toBe('H3');
  },
};

export const SmallSize: Story = {
  args: { size: 'sm' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Otsikko' }).tagName).toBe('H3');
  },
};

export const RootHasNoPadding: Story = {
  render: () => (
    <>
      <Card title="Suuri" size="lg" data-testid="large" />
      <Card title="Pieni" size="sm" data-testid="small" />
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
      <Card title="Suuri" size="lg" data-testid="lg" />
      <Card title="Keskikokoinen" size="md" data-testid="md" />
      <Card title="Pieni" size="sm" data-testid="sm" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const large = parseFloat(getComputedStyle(canvas.getByTestId('lg-content')).padding);
    const medium = parseFloat(getComputedStyle(canvas.getByTestId('md-content')).padding);
    const small = parseFloat(getComputedStyle(canvas.getByTestId('sm-content')).padding);

    await expect(small).toBeLessThan(medium);
    await expect(medium).toBeLessThan(large);
  },
};

export const WithCustomClassName: Story = {
  args: { className: 'consumer-custom-class' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('card').className).toContain('consumer-custom-class');
  },
};

export const WithTitleOrderOverride: Story = {
  args: { size: 'lg', titleOrder: 4 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // `size="lg"` defaults to H2 — an explicit `titleOrder` must win, so a Card
    // nested under an existing heading level isn't forced to emit a second H2.
    await expect(canvas.getByRole('heading', { name: 'Otsikko' }).tagName).toBe('H4');
  },
};

export const RootHasNoInteractiveAffordance: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('card');

    // Card is a static container — it must never itself become clickable or
    // focusable, so nested interactive elements (in `actions`/`children`)
    // stay the only way to interact with it.
    await expect(card).not.toHaveAttribute('tabindex');
    await expect(card.getAttribute('role')).not.toBe('button');
    await expect(card.onclick).toBeNull();
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
  // Card fills its parent's width by design (no width cap of its own) — a
  // realistic single-column width here keeps the 3:2 media block from
  // stretching to Storybook's full canvas width, matching how Card is
  // actually placed (a grid cell/column), not a bug in the ratio itself.
  render: (args) => (
    <div style={{ width: 600 }}>
      <Card {...args} />
    </div>
  ),
  args: { media: <img alt="" src={sizedMediaImage} /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('card');
    const media = canvas.getByRole('img');
    const mediaWrapper = media.parentElement as HTMLElement;

    await expect(getComputedStyle(mediaWrapper).padding).toBe('0px');
    // Regression: the wrapper must size to the image, not collapse to 0 height
    // in the default column layout (only the `left` row layout splits the
    // wrapper 50/50 with `content`, via `flex: 0 0 50%` on each side).
    await expect(mediaWrapper.getBoundingClientRect().height).toBeGreaterThanOrEqual(190);

    // Regression: the image itself must fill the wrapper's full width, not
    // sit at its own intrinsic size (the 260px placeholder image is narrower
    // than the card) — the wrapper div already stretches full-width via flex,
    // so this has to be checked on the `<img>`, not its wrapper.
    const cardWidth = card.getBoundingClientRect().width;
    const mediaImgWidth = media.getBoundingClientRect().width;
    await expect(Math.abs(mediaImgWidth - cardWidth)).toBeLessThan(2);

    // The `top` frame is a fixed 3:2 box — the image crops to fill it rather
    // than dictating the box's own height.
    const mediaHeight = mediaWrapper.getBoundingClientRect().height;
    await expect(Math.abs(cardWidth / mediaHeight - 1.5)).toBeLessThan(0.05);
    await expect(getComputedStyle(media).objectFit).toBe('cover');
  },
};

const oversizedMediaImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="900" height="300"><rect width="900" height="300" fill="#ccc"/></svg>'
)}`;

export const MediaDoesNotOverflowCard: Story = {
  render: (args) => (
    <div style={{ width: 320 }}>
      <Card {...args} />
    </div>
  ),
  args: { media: <img alt="" src={oversizedMediaImage} /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('card');
    const media = canvas.getByRole('img');

    await expect(media.getBoundingClientRect().width).toBeLessThanOrEqual(
      card.getBoundingClientRect().width
    );
  },
};

export const WithMediaLeft: Story = {
  tags: docExample,
  // Same rationale as `WithMediaTop` — a realistic row width instead of
  // Storybook's full canvas width.
  render: (args) => (
    <div style={{ width: 1200 }}>
      <Card {...args} />
    </div>
  ),
  args: {
    media: <img alt="" src={sizedMediaImage} />,
    mediaPlacement: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('card')).flexDirection).toBe('row');
  },
};

export const WithMediaLeftSplitsWidthEvenly: Story = {
  render: (args) => (
    <div style={{ width: 640 }}>
      <Card {...args} />
    </div>
  ),
  args: {
    media: <img alt="" src={oversizedMediaImage} />,
    mediaPlacement: 'left',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const media = canvas.getByRole('img');
    const mediaWrapper = media.parentElement as HTMLElement;
    const content = canvas.getByTestId('card-content');

    // Regression: `flex: 0 0 50%` on the media wrapper should split the row
    // ~50/50 with `content`, not let the (constrained) image size the column.
    const mediaWidth = mediaWrapper.getBoundingClientRect().width;
    const contentWidth = content.getBoundingClientRect().width;
    await expect(Math.abs(mediaWidth - contentWidth)).toBeLessThan(2);

    // `left` placement has no fixed aspect ratio (unlike `top`) — the media
    // column instead stretches to match `content`'s height (default flex-row
    // stretch), and the cropped image must fill that box exactly on both axes.
    const mediaHeight = mediaWrapper.getBoundingClientRect().height;
    const contentHeight = content.getBoundingClientRect().height;
    await expect(Math.abs(mediaHeight - contentHeight)).toBeLessThan(2);
    await expect(Math.abs(media.getBoundingClientRect().width - mediaWidth)).toBeLessThan(2);
    await expect(Math.abs(media.getBoundingClientRect().height - mediaHeight)).toBeLessThan(2);
    await expect(getComputedStyle(media).objectFit).toBe('cover');
  },
};

export const MediaPlacementLeftIgnoredWithoutMedia: Story = {
  args: { mediaPlacement: 'left' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Documented as "ignored when `media` is omitted" — must stay in the
    // default column layout, not switch to the row layout with no media to show.
    await expect(getComputedStyle(canvas.getByTestId('card')).flexDirection).toBe('column');
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

    // Card has no onClick of its own — a TextLink in `children` must stay
    // independently focusable, the same guarantee `WithActions` already
    // covers for a nested Button.
    await userEvent.tab();
    await expect(link).toHaveFocus();
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

export const TurquoiseBackgroundTextLinkFocusUsesInvertedOutline: Story = {
  args: {
    background: 'turquoise',
    children: <TextLink href="#">Lue lisää</TextLink>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await userEvent.tab();
    await expect(link).toHaveFocus();
    // The neutral focusRing outline (`focus.visible`, #1e1e22) fails WCAG's
    // 3:1 non-text contrast minimum against Card's colored backgrounds — must
    // use the inverted outline color (`focus.visibleInverted`, white) here
    // instead, the same allowlist-driven inversion `color` already gets (#116).
    await expect(getComputedStyle(link).outlineColor).toBe('rgb(255, 255, 255)');
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
    // Asserted against the concrete `states.default` value (not just
    // `.not.toBe(white)`) so this can't silently pass for any wrong color —
    // see the constraint documented on `CardProps['background']`: this pairing
    // is known to fail contrast on colored backgrounds until #115 ships an
    // inverted Button variant.
    await expect(getComputedStyle(canvas.getByRole('button')).color).toBe('rgb(41, 84, 154)');
  },
};

export const TurquoiseBackgroundChipInChildrenKeepsOwnColors: Story = {
  args: {
    background: 'turquoise',
    children: (
      <Chip checked={false} onChange={() => {}}>
        Suodatin
      </Chip>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Like Button, Chip has its own light surface — force-inverting its text
    // to white would make it unreadable against its own background, not the
    // Card's. Only Card's own text content (Typography/TextLink) should invert.
    await expect(getComputedStyle(canvas.getByText('Suodatin')).color).not.toBe(
      'rgb(255, 255, 255)'
    );
  },
};

export const TurquoiseBackgroundButtonInActionsKeepsOwnColors: Story = {
  args: {
    background: 'turquoise',
    actions: <Button variant="secondary">Toiminto</Button>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Same guarantee as `TurquoiseBackgroundButtonInChildrenKeepsOwnColors`,
    // but for the `actions` slot — the inversion allowlist excludes Button
    // regardless of which slot it's nested in. Same concrete-value assertion
    // for the same reason (see that story's comment, and #115).
    await expect(getComputedStyle(canvas.getByRole('button')).color).toBe('rgb(41, 84, 154)');
  },
};

export const TurquoiseBackgroundActionsTextLinkInverts: Story = {
  args: {
    background: 'turquoise',
    actions: <TextLink href="#">Lue lisää</TextLink>,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Unlike Button, a TextLink in `actions` has no independent surface of its
    // own — it should invert the same way one nested in `children` already does.
    await expect(getComputedStyle(canvas.getByRole('link')).color).toBe('rgb(255, 255, 255)');
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

// ── Dev-warning tests (verifies the console.error guards in Card.tsx) ────────

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

export const WarnsOnInvalidSize: Story = {
  // `as any` simulates a non-TS consumer passing a value outside the
  // documented union — must warn rather than silently dropping both the
  // padding and the heading's typography variant entirely.
  args: { size: 'invalid' as never },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /invalid `size` value/.test(m))).toBe(true)
    );
  },
};

export const WarnsOnInvalidTitleOrder: Story = {
  args: { titleOrder: 6 as never },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /invalid `titleOrder` value/.test(m))).toBe(true)
    );
  },
};

export const WarnsOnInvalidMediaPlacement: Story = {
  args: { media: <img alt="" src={sizedMediaImage} />, mediaPlacement: 'invalid' as never },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /invalid `mediaPlacement` value/.test(m))).toBe(true)
    );
  },
};

export const FixedSurfacePropsCannotBeOverridden: Story = {
  // Simulates a non-TS consumer passing one of Card's fixed Paper props through
  // (`CardProps` doesn't declare them, so a typed caller can't) — Card's own
  // `radius`/`withShadow`/`padding` must still win, since Card's whole surface
  // contract (edge-to-edge media, no visible border) depends on them.
  args: { radius: 'pill', withShadow: false, padding: 'lg' } as never,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByTestId('card');
    const style = getComputedStyle(card);

    await expect(style.borderRadius).toBe('0px');
    await expect(style.boxShadow).not.toBe('none');
    await expect(style.padding).toBe('0px');
  },
};
