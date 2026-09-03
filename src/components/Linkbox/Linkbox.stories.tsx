import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import { Button } from '../Button';
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
  // Simple mode's whole box is the `<a>` — its accessible name must be just
  // `title`, not eyebrow+title+description read together as one link name.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    await expect(link).toHaveAccessibleName('Otsikko');
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

export const InvertedFocusVisibleUsesInvertedOutline: Story = {
  args: { inverted: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link');

    (link as HTMLAnchorElement).focus();
    // Neutral outline (#1e1e22) fails WCAG's 3:1 non-text-contrast minimum
    // against the turquoise background — must use the white inverted outline,
    // same guarantee Card already gives nested TextLink focus on colored bg.
    await expect(getComputedStyle(link).outlineColor).toBe('rgb(255, 255, 255)');
  },
};

export const InvertedFocusVisibleKeepsOpaqueBackground: Story = {
  // Regression: the focus/hover overlay tint was applied via `backgroundColor`
  // — on the same element as Paper's own opaque turquoise `backgroundColor` in
  // simple mode, a translucent `rgba(255,255,255,0.1)` override replaced (not
  // tinted) it, leaving the box ~90% transparent and effectively invisible
  // against the page. Must stay layered via `backgroundImage` instead, so the
  // underlying `backgroundColor` is untouched by focus/hover.
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

export const WithActions: Story = {
  tags: docExample,
  args: {
    actions: (
      <Button variant="secondary" onClick={fn()}>
        Lue lisää
      </Button>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Nested mode: the box has a covering primary link, AND the Button in
    // `actions` stays independently reachable/clickable — no nested
    // anchor-in-anchor (the primary link and the Button are siblings, not
    // ancestor/descendant), and only one accessible link name for the box.
    const links = canvas.getAllByRole('link');
    await expect(links).toHaveLength(1);
    await expect(links[0]).toHaveAccessibleName('Otsikko');
    await expect(links[0].querySelector('button')).toBeNull();

    const button = canvas.getByRole('button', { name: 'Lue lisää' });
    await expect(button.closest('a')).toBeNull();
  },
};

export const NestedModeSpacingMatchesSimpleMode: Story = {
  // Regression: wrapping content in the overlay mode's positioned div
  // (`positionedContent`) previously stranded the icon row in plain block
  // flow, losing `root`'s flex gap and leaving the arrow flush against the
  // description instead of Figma's `card.spacing` (24px) gap — caught
  // visually in Storybook, not by the other structural assertions above.
  args: { actions: <Button variant="secondary">Lue lisää</Button> },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const description = canvas.getByText('Kuvaava teksti');
    const icon = canvas.getByRole('link').parentElement!.querySelector('svg')!;

    const gap = icon.getBoundingClientRect().top - description.getBoundingClientRect().bottom;
    await expect(gap).toBeGreaterThan(16);
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

export const WithCustomLink: Story = {
  args: { href: undefined },
  render: (args) => (
    <Linkbox
      {...args}
      renderLink={(className) => (
        <a href="#custom" className={className} aria-label={args.title}>
          {/* overlay link — no visible content of its own */}
        </a>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Otsikko' });

    await expect(link).toHaveAttribute('href', '#custom');
    // renderLink (like `actions`) switches Linkbox to the overlay structure —
    // the title text is still rendered as normal visible content, separately
    // from the link element itself.
    await expect(canvas.getByText('Otsikko')).not.toBe(link);
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
      expect(
        capturedConsoleErrors.some((m) => /provide either `href` or `renderLink`/.test(m))
      ).toBe(true)
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

export const WarnsWhenHrefIgnoredByRenderLink: Story = {
  render: (args) => (
    <Linkbox {...args} renderLink={(className) => <a href="#custom" className={className} />} />
  ),
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /`href` is ignored/.test(m))).toBe(true)
    );
  },
};

export const WarnsWhenExternalIgnoredByRenderLink: Story = {
  args: { href: undefined, external: true },
  render: (args) => (
    <Linkbox {...args} renderLink={(className) => <a href="#custom" className={className} />} />
  ),
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /`external` has no effect/.test(m))).toBe(true)
    );
  },
};
