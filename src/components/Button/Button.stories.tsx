import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Button } from './Button';
import { TextField } from '../TextField';
import { Select } from '../Select';
import { SearchIcon } from '../../icons/SearchIcon';
import { ArrowRightIcon } from '../../icons/ArrowRightIcon';
import { vars } from '../../theme';

// Size in-button icons with the design-system icon.size token (a fixed 20px) rather
// than an emoji or a hardcoded value.
const iconSize = vars.theme.components.icon.size.medium;
const iconProps = { style: { width: iconSize, height: iconSize } };

const meta = {
  // Some Button stories below are browser test specs (they have a `play` fn checking
  // a token-driven style, not a distinct visual state), not documentation. Default
  // every story to test-only: still run by the vitest addon (the `test` tag is
  // untouched) but hidden from the sidebar (`!dev`) and the autodocs page
  // (`!autodocs`) so the docs stay a small, curated set. The documentation examples
  // below opt back in with `tags: docExample`.
  tags: ['!dev', '!autodocs'],
  argTypes: {
    children: { control: 'text' },
    variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'tertiary'] },
    radius: { control: { type: 'select' }, options: ['sharp', 'pill'] },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  args: {
    // Figma's own Button component default label ("Button" in Finnish) — real
    // content examples below override this with task-specific copy instead.
    children: 'Painike',
    variant: 'primary',
    radius: 'sharp',
    iconOnly: false,
    disabled: false,
  },
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// Re-adds the visibility tags that `meta` strips, marking a story as a
// documentation example shown in both the sidebar and the autodocs page.
const docExample = ['dev', 'autodocs'];

// ── Documentation examples (visible in sidebar + autodocs) ───────────────────
// Real Finnish task copy (matching this repo's convention elsewhere — DateField's
// "Peruuta", Chip's "Poista Hervanta", SearchField's "Etsi" — rather than generic
// English placeholders), covering every distinct visual state a reader needs.

/** High-emphasis action. Use at most one primary button per view. */
export const Primary: Story = {
  tags: docExample,
  args: { variant: 'primary', children: 'Tallenna' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Tallenna' });

    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(41, 84, 154)');
  },
};

/** Medium emphasis — secondary actions placed alongside a primary button. */
export const Secondary: Story = {
  tags: docExample,
  args: { variant: 'secondary', children: 'Peruuta' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Peruuta' });
    const style = getComputedStyle(button);

    // Bordered, not filled — distinguishes secondary from primary and tertiary.
    await expect(style.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    await expect(style.borderColor).toBe('rgb(41, 84, 154)');
  },
};

/** Low emphasis — tertiary or inline actions. */
export const Tertiary: Story = {
  tags: docExample,
  args: { variant: 'tertiary', children: 'Näytä lisää' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Näytä lisää' });
    const style = getComputedStyle(button);

    // No border box at rest, unlike secondary's solid border on all sides — only
    // a bottom border (transparent, but present), unlike primary which has none.
    await expect(style.borderTopWidth).toBe('0px');
    await expect(parseFloat(style.borderBottomWidth)).toBeGreaterThan(0);
  },
};

/** Disabled appearance for each variant. */
export const Disabled: Story = {
  tags: docExample,
  args: { disabled: true },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} variant="primary">
        Tallenna
      </Button>
      <Button {...args} variant="secondary">
        Peruuta
      </Button>
      <Button {...args} variant="tertiary">
        Näytä lisää
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Figma's disabled label/icon color is `text/disabled` (#686872), not the
    // `Common/Disabled` (#c9c9ce) token used for the secondary variant's border.
    for (const name of ['Tallenna', 'Peruuta', 'Näytä lisää']) {
      const button = canvas.getByRole('button', { name });
      await expect(getComputedStyle(button).color).toBe('rgb(104, 104, 114)');
    }
  },
};

/**
 * Pill-shaped corners (issue #73) on primary/secondary. Tertiary has no border box
 * to round, and Figma doesn't pair `Corner-radius: Rounded` with Tertiary, so
 * `radius="pill"` is a no-op there — shown here rather than omitted so the
 * no-op is visible and intentional, not a silent gap.
 */
export const Rounded: Story = {
  tags: docExample,
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} variant="primary" radius="pill">
        Tallenna
      </Button>
      <Button {...args} variant="secondary" radius="pill">
        Peruuta
      </Button>
      <Button {...args} variant="tertiary" radius="pill">
        Näytä lisää
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['Tallenna', 'Peruuta']) {
      const button = canvas.getByRole('button', { name });
      await expect(getComputedStyle(button).borderRadius).toBe('9999px');
    }

    // Tertiary stays sharp — rounding its bottom-only border would bow it into
    // an arc instead of a straight underline (see Button.css.ts).
    const tertiaryButton = canvas.getByRole('button', { name: 'Näytä lisää' });
    await expect(getComputedStyle(tertiaryButton).borderRadius).toBe('0px');
  },
};

/**
 * Icon-only button (Figma's `Icon-only: Yes` variant) — uniform padding on all
 * sides instead of the wider horizontal padding a labeled button uses.
 * Always provide an aria-label for accessibility.
 */
export const WithoutText: Story = {
  tags: docExample,
  render: (args) => (
    <Button {...args} iconOnly aria-label="Etsi">
      <SearchIcon {...iconProps} />
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Etsi' });
    const style = getComputedStyle(button);

    await expect(style.paddingLeft).toBe(style.paddingTop);
  },
};

/** Leading, trailing, or both icons alongside the label. */
export const Icons: Story = {
  tags: docExample,
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} leftIcon={<SearchIcon {...iconProps} />}>
        Etsi
      </Button>
      <Button {...args} rightIcon={<ArrowRightIcon {...iconProps} />}>
        Seuraava
      </Button>
      <Button
        {...args}
        leftIcon={<SearchIcon {...iconProps} />}
        rightIcon={<ArrowRightIcon {...iconProps} />}
      >
        Jatka
      </Button>
    </div>
  ),
};

// ── Test-only specs (hidden from sidebar + autodocs, still run as browser tests) ──

/** Default (sharp) corners stay unaffected when `radius` isn't set. */
export const RadiusDefaultsToSharp: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Painike' });

    await expect(getComputedStyle(button).borderRadius).toBe('0px');
  },
};

/** `iconOnly` and `radius="pill"` compose — both are orthogonal to `variant`. */
export const IconOnlyRounded: Story = {
  args: { iconOnly: true, radius: 'pill', 'aria-label': 'Etsi' },
  render: (args) => (
    <Button {...args}>
      <SearchIcon {...iconProps} />
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Etsi' });
    const style = getComputedStyle(button);

    await expect(style.borderRadius).toBe('9999px');
    await expect(style.paddingLeft).toBe(style.paddingTop);
  },
};

/** Pill corners persist on a disabled button (tertiary stays sharp, see `Rounded`). */
export const RoundedDisabled: Story = {
  args: { radius: 'pill', disabled: true },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} variant="primary">
        Tallenna
      </Button>
      <Button {...args} variant="secondary">
        Peruuta
      </Button>
      <Button {...args} variant="tertiary">
        Näytä lisää
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['Tallenna', 'Peruuta']) {
      const button = canvas.getByRole('button', { name });
      await expect(getComputedStyle(button).borderRadius).toBe('9999px');
    }

    const tertiaryButton = canvas.getByRole('button', { name: 'Näytä lisää' });
    await expect(getComputedStyle(tertiaryButton).borderRadius).toBe('0px');
  },
};

/**
 * Figma splits horizontal/vertical padding across two different spacing tokens
 * (`spacing/medium` horizontal, `spacing/small` vertical) — they must differ.
 */
export const HorizontalPaddingExceedsVertical: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Painike' });
    const style = getComputedStyle(button);

    await expect(parseFloat(style.paddingLeft)).toBeGreaterThan(parseFloat(style.paddingTop));
  },
};

/** Figma's button label uses Semi-Bold weight (600), matching Chip's label weight. */
export const LabelIsSemiBold: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Painike' });

    await expect(getComputedStyle(button).fontWeight).toBe('600');
  },
};

/**
 * All single-line controls (text input, select, button variants) must render at the
 * same shared, responsive control height — borders absorbed via box-sizing (issue #79).
 *
 * Inputs (which carry a label above the box) sit on the left and the buttons on the
 * right, bottom-aligned: because every control box is the same height, their bottom
 * borders land on a single line.
 */
export const ControlHeightConsistency: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16 }}>
      <TextField inputLabel="Text input" placeholder="Input" />
      <Select inputLabel="Select picker" options={['One', 'Two']} />
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const textInput = canvas.getByRole('textbox', { name: 'Text input' });
    const selectInput = canvas.getByRole('textbox', { name: 'Select picker' });
    const primary = canvas.getByRole('button', { name: 'Primary' });
    const secondary = canvas.getByRole('button', { name: 'Secondary' });
    const tertiary = canvas.getByRole('button', { name: 'Tertiary' });
    const controls = [textInput, selectInput, primary, secondary, tertiary];

    const heightOf = (el: Element) => el.getBoundingClientRect().height;
    const bottomOf = (el: Element) => el.getBoundingClientRect().bottom;

    // Variants reach the same border-box height via different border configs (primary has
    // none, secondary a full border, tertiary a bottom border), so allow 1px of sub-pixel
    // rounding slack rather than asserting exact equality.
    const TOLERANCE = 1;

    // Primary is the design source of truth: every control matches its height, and
    // bottom-alignment puts every bottom border on the same line.
    const referenceHeight = heightOf(primary);
    const referenceBottom = bottomOf(primary);
    await expect(referenceHeight).toBeGreaterThan(0);
    for (const control of controls) {
      await expect(Math.abs(heightOf(control) - referenceHeight)).toBeLessThanOrEqual(TOLERANCE);
      await expect(Math.abs(bottomOf(control) - referenceBottom)).toBeLessThanOrEqual(TOLERANCE);
    }
  },
};
