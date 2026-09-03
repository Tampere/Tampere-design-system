import type { AnchorHTMLAttributes } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Linkbox } from './Linkbox';

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
