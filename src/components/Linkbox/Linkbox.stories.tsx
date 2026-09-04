import type { AnchorHTMLAttributes } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Linkbox } from './Linkbox';

// A 1x1 GIF has no real intrinsic size, so it can't catch the media wrapper
// collapsing to 0 height in the default (top) layout — this SVG has real
// width/height and stands in for a real photo (same fixture Card's own media
// stories use).
const sizedMediaImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="260" height="195"><rect width="260" height="195" fill="#ccc"/></svg>'
)}`;

const meta = {
  component: Linkbox,
  tags: ['!dev', '!autodocs'],
  args: {
    href: '#',
    title: 'Otsikko',
    eyebrow: 'Lisätietoa',
    description: 'Kuvaava teksti',
    'data-testid': 'linkbox',
  },
} satisfies Meta<typeof Linkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });

    await expect(link).toHaveAttribute('href', '#');
    await expect(canvas.getByText('Lisätietoa')).not.toBeNull();
    await expect(canvas.getByText('Kuvaava teksti')).not.toBeNull();
    // The internal `ArrowRightIcon` has 2 `<path>`s; `OpenExternalLinkIcon`
    // (asserted in `External` below) has 3 — a stable, implementation-light
    // way to confirm the *internal* icon renders here, not just "some SVG".
    await expect(link.querySelectorAll('svg path').length).toBe(2);

    const style = getComputedStyle(link);
    // Figma "Card link content" — Background/Default = #ffffff.
    await expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(link.tagName).toBe('A');
  },
};

export const AccessibleNameIsTitleOnly: Story = {
  // The whole box is the `<a>` — its accessible name must be just `title`,
  // not eyebrow+title+description read together as one link name.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAccessibleName('Otsikko');
  },
};

export const RespectsConsumerAriaLabelOverride: Story = {
  // Regression: `aria-label` is a valid prop (via `AriaAttributes`) that used
  // to land in the rest-spread and then get silently overwritten by the
  // `title`-derived one — a consumer's accessibility override must win.
  args: { 'aria-label': 'Mukautettu nimi' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAccessibleName('Mukautettu nimi');
  },
};

export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    (link as HTMLAnchorElement).focus();
    const style = getComputedStyle(link);
    await expect(style.outlineStyle).toBe('solid');
    // Figma's focus-visible outline color, #1e1e22 = focus.visible.
    await expect(style.outlineColor).toBe('rgb(30, 30, 34)');
  },
};

export const FocusVisibleKeepsOpaqueBackground: Story = {
  // Same layering guarantee as `InvertedFocusVisibleKeepsOpaqueBackground`,
  // asserted on the default (non-inverted) surface too — the hover/focus
  // tint must stay layered via `backgroundImage`, not replace the white
  // `backgroundColor` outright.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    (link as HTMLAnchorElement).focus();
    const style = getComputedStyle(link);
    await expect(style.backgroundColor).toBe('rgb(255, 255, 255)');
    await expect(style.backgroundImage).not.toBe('none');
  },
};

export const InvertedColor: Story = {
  tags: docExample,
  args: { inverted: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });
    const style = getComputedStyle(link);

    // Figma "Card link content" Inverted = Turquoise/300 = #0074a4, the same
    // token Paper's own `background="turquoise"` already uses.
    await expect(style.backgroundColor).toBe('rgb(0, 116, 164)');
    await expect(getComputedStyle(canvas.getByText('Otsikko')).color).toBe('rgb(255, 255, 255)');
    await expect(getComputedStyle(canvas.getByText('Lisätietoa')).color).toBe('rgb(255, 255, 255)');
    await expect(getComputedStyle(canvas.getByText('Kuvaava teksti')).color).toBe(
      'rgb(255, 255, 255)'
    );
  },
};

export const InvertedFocusVisibleUsesSameOutlineAsDefault: Story = {
  // Unlike Card's nested TextLink focus ring (which does invert to white
  // against Card's colored backgrounds), Figma's own "Card link content"
  // Focus-visible/Outline variable is the same dark #1e1e22 for both the
  // Default and Inverted focus cells — Linkbox's own box-level focus ring
  // doesn't get an inverted variant.
  args: { inverted: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    (link as HTMLAnchorElement).focus();
    await expect(getComputedStyle(link).outlineColor).toBe('rgb(30, 30, 34)');
  },
};

export const InvertedFocusVisibleKeepsOpaqueBackground: Story = {
  // Regression: the focus/hover overlay tint was applied via `backgroundColor`
  // — on the same element as Paper's own opaque turquoise `backgroundColor`,
  // a translucent `rgba(255,255,255,0.1)` override replaced (not tinted) it,
  // leaving the box ~90% transparent and effectively invisible against the
  // page. Must stay layered via `backgroundImage` instead, so the underlying
  // `backgroundColor` is untouched by focus/hover.
  args: { inverted: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    (link as HTMLAnchorElement).focus();
    const style = getComputedStyle(link);
    await expect(style.backgroundColor).toBe('rgb(0, 116, 164)');
    await expect(style.backgroundImage).not.toBe('none');
  },
};

export const WithMediaTop: Story = {
  tags: docExample,
  render: (args) => (
    <div style={{ width: 600 }}>
      <Linkbox {...args} />
    </div>
  ),
  args: { media: <img alt="" src={sizedMediaImage} /> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });
    const media = canvas.getByRole('img');
    const mediaWrapper = media.parentElement as HTMLElement;

    // Media bleeds to the edge — no padding on its own wrapper (Card's same
    // regression: padding lives on the text-content wrapper, not the root).
    await expect(getComputedStyle(mediaWrapper).padding).toBe('0px');
    const linkWidth = link.getBoundingClientRect().width;
    const mediaHeight = mediaWrapper.getBoundingClientRect().height;
    // Fixed 3:2 box — the image crops to fill it, not the other way around.
    await expect(Math.abs(linkWidth / mediaHeight - 1.5)).toBeLessThan(0.05);
    await expect(getComputedStyle(media).objectFit).toBe('cover');
  },
};

export const WithMediaLeft: Story = {
  tags: docExample,
  // `left`'s row split is driven by a container query on Linkbox's own
  // rendered width (not the viewport) — a plain fixed-width wrapper is
  // enough to exercise it deterministically, same as `WithMediaTop` above.
  render: (args) => (
    <div style={{ width: 1200 }}>
      <Linkbox {...args} />
    </div>
  ),
  args: { media: <img alt="" src={sizedMediaImage} />, mediaPlacement: 'left' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });
    // The row/column flex layout lives on Linkbox's inner wrapper, not the
    // `<a>` itself — see Linkbox.tsx's comment on why they're split.
    const layout = link.firstElementChild as HTMLElement;
    await expect(getComputedStyle(layout).flexDirection).toBe('row');
  },
};

export const WithMediaLeftCollapsesToStackedBelowMdBreakpoint: Story = {
  // A 50/50 row split gets cramped once Linkbox's own rendered width narrows
  // past tablet width — below the `md` (768px) container-query breakpoint,
  // `left` falls back to the same stacked layout `top` uses by default. This
  // is keyed off Linkbox's own width (a container query), not the viewport —
  // so a `left`-placed Linkbox squeezed into a narrow grid column collapses
  // correctly even on a wide screen, unlike a viewport `@media` query would.
  tags: docExample,
  render: (args) => (
    <div style={{ width: 480 }}>
      <Linkbox {...args} />
    </div>
  ),
  args: { media: <img alt="" src={sizedMediaImage} />, mediaPlacement: 'left' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });
    const media = canvas.getByRole('img');
    const mediaWrapper = media.parentElement as HTMLElement;
    // The row/column flex layout lives on Linkbox's inner wrapper, not the
    // `<a>` itself — see Linkbox.tsx's comment on why they're split.
    const layout = link.firstElementChild as HTMLElement;

    await expect(getComputedStyle(layout).flexDirection).toBe('column');
    // Genuinely stacked like `top`, not just "not row" — full-width 3:2 box.
    const linkWidth = link.getBoundingClientRect().width;
    const mediaHeight = mediaWrapper.getBoundingClientRect().height;
    await expect(Math.abs(linkWidth / mediaHeight - 1.5)).toBeLessThan(0.05);
  },
};

export const External: Story = {
  tags: docExample,
  args: { external: true, href: 'https://tampere.fi' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /^Otsikko/ });

    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAccessibleName(/avautuu uuteen välilehteen/);
    // The external `OpenExternalLinkIcon` has 3 `<path>`s, vs. the internal
    // `ArrowRightIcon`'s 2 (asserted in `Default` above) — confirms the icon
    // actually swapped, not just that `external`'s other side effects fired.
    await expect(link.querySelectorAll('svg path').length).toBe(3);
  },
};

export const AppendsExternalLabelToConsumerAriaLabelOverride: Story = {
  // Regression guard: a consumer's own `aria-label` must not silently drop
  // `external`'s screen-reader signal — see the comment on `baseAccessibleName`
  // in Linkbox.tsx. Issue #75 requires external links to be flagged to AT
  // regardless of whether the accessible name is the default `title` or a
  // consumer override.
  args: { external: true, href: 'https://tampere.fi', 'aria-label': 'Mukautettu nimi' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAccessibleName(/^Mukautettu nimi/);
    await expect(link).toHaveAccessibleName(/avautuu uuteen välilehteen/);
  },
};

// A minimal stand-in for a router `Link` component (Next.js `Link`, React
// Router's `Link`, etc.) — forwards everything through to a real `<a>`.
function FakeRouterLink({ href, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={href} data-router-link="true" {...props} />;
}

export const WithCustomComponent: Story = {
  tags: docExample,
  args: { component: FakeRouterLink },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });

    await expect(link).toHaveAttribute('data-router-link', 'true');
    await expect(link).toHaveAttribute('href', '#');
    // Paper's own styling (padding/background/etc.) still applies through
    // the swapped element, same guarantee Paper's `PolymorphicComponent`
    // story already gives `<Paper component="section">`.
    await expect(getComputedStyle(link).backgroundColor).toBe('rgb(255, 255, 255)');
  },
};

export const WithCustomComponentAndExternal: Story = {
  // `external`'s `target`/`rel`/accessible-name contract must still apply
  // when the root element is swapped via `component` (e.g. a router `Link`),
  // not just the default `<a>`.
  args: { component: FakeRouterLink, external: true, href: 'https://tampere.fi' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /^Otsikko/ });

    await expect(link).toHaveAttribute('data-router-link', 'true');
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link).toHaveAccessibleName(/avautuu uuteen välilehteen/);
  },
};

export const WithTitleOrderOverride: Story = {
  args: { titleOrder: 4 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('heading', { name: 'Otsikko' }).tagName).toBe('H4');
  },
};

export const WithCustomClassName: Story = {
  args: { className: 'consumer-custom-class' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('linkbox').className).toContain('consumer-custom-class');
  },
};

let forwardedRefNode: HTMLElement | null = null;

export const ForwardsRefToRenderedElement: Story = {
  // `forwardRef<HTMLDivElement, LinkboxProps>` (see Linkbox.tsx) forwards
  // straight through to `Paper` with no cast at this boundary — a regression
  // that forwarded the ref to the wrong node, or dropped it, would still
  // type-check cleanly, so only a test like this one catches it.
  render: (args) => {
    forwardedRefNode = null;
    return (
      <Linkbox
        {...args}
        ref={(node) => {
          forwardedRefNode = node;
        }}
      />
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });

    await waitFor(() => expect(forwardedRefNode).not.toBeNull());
    await expect(forwardedRefNode).toBe(link);
  },
};

export const MergesRelWithExternal: Story = {
  args: { external: true, rel: 'nofollow' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /^Otsikko/ });

    await expect(link).toHaveAttribute('rel', 'noopener noreferrer nofollow');
  },
};

// ── Dev-warning tests (verifies the console.error guards in Linkbox.tsx) ──

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

export const WarnsWhenTargetIgnoredByExternal: Story = {
  args: { external: true, target: '_self' },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /`target` is ignored/.test(m))).toBe(true)
    );
  },
};

export const WarnsWithInvalidTitleOrder: Story = {
  // `titleOrder` isn't looked up in a `styleVariants` map (it drives a plain
  // object lookup passed to `Typography`'s `component` prop), so an
  // out-of-union value would otherwise silently drop the heading-tag
  // override with no signal — same risk class Card's identical prop guards.
  args: { titleOrder: 6 as unknown as 2 | 3 | 4 | 5 },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /invalid `titleOrder`/.test(m))).toBe(true)
    );
  },
};

export const WarnsWithInvalidMediaPlacement: Story = {
  // Same risk class as `WarnsWithInvalidTitleOrder` above: an out-of-union
  // `mediaPlacement` silently falls back to the `top`/stacked layout with no
  // other signal (see the guard in Linkbox.tsx).
  args: {
    media: <img alt="" src={sizedMediaImage} />,
    mediaPlacement: 'bottom' as unknown as 'top' | 'left',
  },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /invalid `mediaPlacement`/.test(m))).toBe(true)
    );
  },
};

export const WithMediaLeftAsFlexItemFillsAvailableWidth: Story = {
  // Regression: `leftMarker`'s `containerType: 'inline-size'` computes the
  // container's own inline size as though it had no content — without an
  // explicit width, a `left`-placed Linkbox used as a flex item (the common
  // real-world layout: a row of cards) collapsed to 0 width instead of
  // sharing the row. `WithMediaLeft`/`...CollapsesToStackedBelowMdBreakpoint`
  // above don't catch this — they wrap in a plain block-level div, which
  // doesn't hit the bug (a block box's `width: auto` already fills its
  // containing block regardless of content). This story wraps in a flex row
  // instead, with no explicit width on the Linkbox itself, to exercise the
  // actual failure mode.
  args: { media: <img alt="" src={sizedMediaImage} />, mediaPlacement: 'left' },
  render: (args) => (
    <div style={{ display: 'flex', width: 1200 }}>
      <Linkbox {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });

    await expect(link.getBoundingClientRect().width).toBeGreaterThan(0);
  },
};

export const StretchedByFlexRowFillsFullHeight: Story = {
  // Regression: the inner flex wrapper (`root` in Linkbox.css.ts) had no
  // explicit height. Card's own `root` sits directly on the stretched
  // flex/grid item, so it's stretched for free — Linkbox's `root` lives one
  // level *down* on an inner `<div>` that a plain `align-items: stretch`
  // doesn't reach, so it only grew to its content's intrinsic height,
  // leaving bare surface below the media/icon row instead of filling the
  // box. `WithMediaLeftAsFlexItemFillsAvailableWidth` above doesn't catch
  // this — the Linkbox is that row's only item, so nothing stretches it.
  // This story adds a much taller sibling to force a real stretch and
  // asserts the media fills the full stretched height, not just its own
  // intrinsic height.
  args: { media: <img alt="" src={sizedMediaImage} />, mediaPlacement: 'left' },
  render: (args) => (
    <div style={{ display: 'flex', width: 1200 }}>
      <Linkbox {...args} />
      <div style={{ height: 600, width: 1 }} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });
    const media = canvas.getByRole('img');
    const mediaWrapper = media.parentElement as HTMLElement;

    const linkRect = link.getBoundingClientRect();
    const mediaRect = mediaWrapper.getBoundingClientRect();
    await expect(linkRect.height).toBeGreaterThanOrEqual(600);
    await expect(Math.abs(mediaRect.bottom - linkRect.bottom)).toBeLessThan(1);
  },
};
