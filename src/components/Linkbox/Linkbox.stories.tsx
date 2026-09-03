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

// `vitest/browser`'s `page.viewport` resizes the story's own iframe — the
// only way to actually exercise a real `@media` breakpoint (Linkbox's
// `left`-placement collapse is the first such rule in this repo; every other
// breakpoint behaviour comes from `vars.theme` swapping value at `:root`,
// which every ambient test already picks up regardless of viewport size).
//
// This module throws at evaluation time when loaded outside Vitest Browser
// Mode — which is exactly what happens when this SAME `.stories.tsx` file is
// loaded by Storybook's own plain dev server (not the Vitest test runner) to
// render/browse these stories interactively. A static top-level import would
// crash that module for the *entire* file, not just the stories that use it.
// Dynamic-import it lazily instead, and swallow the "not in Browser Mode"
// case as a no-op — outside Vitest there's no real viewport to resize, and
// the two stories that need it are tagged test-only (`!dev`/`!autodocs`)
// precisely because their assertions only hold under an actual resize.
async function resizeViewport(width: number, height: number) {
  try {
    const { page } = await import('vitest/browser');
    await page.viewport(width, height);
  } catch {
    // Not running under Vitest Browser Mode — nothing to resize.
  }
}

const WIDE_VIEWPORT = [1024, 768] as const;

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
    await expect(link.querySelector('svg')).not.toBeNull();

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
  // Plain visual example — no viewport manipulation, so it renders correctly
  // in Storybook's own dev server too (see `resizeViewport` above). Whether
  // it actually shows the row or the collapsed layout depends on the ambient
  // canvas width; the two behaviours are asserted precisely (and test-only,
  // since they need a real resize) by the two stories below.
  tags: docExample,
  args: { media: <img alt="" src={sizedMediaImage} />, mediaPlacement: 'left' },
};

export const WithMediaLeftUsesRowLayoutAtWideViewport: Story = {
  // Test-only (not `docExample`): needs a real Vitest Browser Mode viewport
  // resize to mean anything, which `WithMediaLeft` above deliberately avoids.
  args: { media: <img alt="" src={sizedMediaImage} />, mediaPlacement: 'left' },
  play: async ({ canvasElement }) => {
    await resizeViewport(1280, 900);
    try {
      const canvas = within(canvasElement);
      const link = canvas.getByRole('link', { name: 'Otsikko' });
      await expect(getComputedStyle(link).flexDirection).toBe('row');
    } finally {
      await resizeViewport(...WIDE_VIEWPORT);
    }
  },
};

export const WithMediaLeftCollapsesToStackedBelowMdBreakpoint: Story = {
  // A 50/50 row split gets cramped once the whole card narrows past tablet
  // width — below the `md` (768px) breakpoint, `left` falls back to the same
  // stacked layout `top` uses by default.
  args: { media: <img alt="" src={sizedMediaImage} />, mediaPlacement: 'left' },
  play: async ({ canvasElement }) => {
    await resizeViewport(480, 900);
    try {
      const canvas = within(canvasElement);
      const link = canvas.getByRole('link', { name: 'Otsikko' });
      const media = canvas.getByRole('img');
      const mediaWrapper = media.parentElement as HTMLElement;

      await expect(getComputedStyle(link).flexDirection).toBe('column');
      // Genuinely stacked like `top`, not just "not row" — full-width 3:2 box.
      const linkWidth = link.getBoundingClientRect().width;
      const mediaHeight = mediaWrapper.getBoundingClientRect().height;
      await expect(Math.abs(linkWidth / mediaHeight - 1.5)).toBeLessThan(0.05);
    } finally {
      await resizeViewport(...WIDE_VIEWPORT);
    }
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

export const WarnsWithoutDestination: Story = {
  args: { href: undefined },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /provide `href`/.test(m))).toBe(true)
    );
  },
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
