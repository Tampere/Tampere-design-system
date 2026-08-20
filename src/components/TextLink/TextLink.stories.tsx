import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { TextLink } from './TextLink';

const meta = {
  component: TextLink,
  // Most TextLink stories are browser test specs (they have a `play` fn), not
  // documentation. Default every story to test-only: still run by the vitest
  // addon (the `test` tag is untouched) but hidden from the sidebar (`!dev`) and
  // the autodocs page (`!autodocs`) so the docs stay a small, curated set. The
  // documentation examples below opt back in with `tags: docExample`.
  tags: ['!dev', '!autodocs'],
  argTypes: {
    href: { control: 'text', description: 'Link destination URL' },
    size: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'subheader', 'p1', 'p2', 'caption'],
      description: 'Typography scale the link renders at',
    },
    visited: { control: 'boolean', description: 'Whether the link has been visited' },
    openExternal: {
      control: 'boolean',
      description: 'Shows an external-link icon and opens in a new tab',
    },
    children: { control: 'text', description: 'Link text' },
  },
  args: {
    href: '#',
    children: 'Tekstilinkki',
    size: 'p1',
    visited: false,
    openExternal: false,
  },
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// Re-adds the visibility tags that `meta` strips, marking a story as a
// documentation example shown in both the sidebar and the autodocs page.
const docExample = ['dev', 'autodocs'];

// ── Documentation examples (visible in sidebar + autodocs) ───────────────────
// These cover every distinct visual state; the interactive behaviours (focus,
// keyboard nav) are discoverable by interacting with them, so the
// behavioural/a11y stories further down stay test-only to keep docs focused.

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Tekstilinkki' });
    const style = getComputedStyle(link);
    // Figma "Default, unvisited" = text/link = #29549a = states.default
    await expect(style.color).toBe('rgb(41, 84, 154)');
    await expect(style.textDecorationLine).toBe('underline');
  },
};

export const Visited: Story = {
  tags: docExample,
  args: { visited: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Tekstilinkki' });
    const style = getComputedStyle(link);
    // Figma "Default, visited" = text/link-visited = #5f93c6 = states.visited
    await expect(style.color).toBe('rgb(95, 147, 198)');
    await expect(style.textDecorationLine).toBe('underline');
  },
};

export const OpenExternal: Story = {
  tags: docExample,
  args: { openExternal: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Tekstilinkki' });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link.querySelector('svg')).not.toBeNull();
  },
};

export const Sizes: Story = {
  tags: docExample,
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      <TextLink {...args} size="h1" href="#h1">
        Heading-sized link
      </TextLink>
      <TextLink {...args} size="caption" href="#caption">
        Caption-sized link
      </TextLink>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const h1Link = canvas.getByRole('link', { name: 'Heading-sized link' });
    const captionLink = canvas.getByRole('link', { name: 'Caption-sized link' });
    const h1Size = parseFloat(getComputedStyle(h1Link).fontSize);
    const captionSize = parseFloat(getComputedStyle(captionLink).fontSize);
    // h1 must render larger than caption at the same breakpoint — proves
    // `size` actually drives the typography token rather than a fixed value.
    await expect(h1Size).toBeGreaterThan(captionSize);
  },
};

export const WithCustomLink: Story = {
  tags: docExample,
  render: (args) => (
    <TextLink
      {...args}
      renderLink={(className) => (
        <a href="#custom" className={className}>
          Custom link component
        </a>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Custom link component' });
    await expect(link).toHaveAttribute('href', '#custom');
    const style = getComputedStyle(link);
    // The renderLink escape hatch still receives TextLink's link styling.
    await expect(style.color).toBe('rgb(41, 84, 154)');
  },
};

// ── Test-only specs (hidden from sidebar/autodocs, still run as browser tests) ─

export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Tekstilinkki' });
    (link as HTMLAnchorElement).focus();
    const style = getComputedStyle(link);
    // Figma "Focus, unvisited" = primary-states/focus = #29549a = states.focus
    await expect(style.color).toBe('rgb(41, 84, 154)');
    await expect(style.textDecorationLine).toBe('underline');
    await expect(style.outlineStyle).toBe('solid');
  },
};
