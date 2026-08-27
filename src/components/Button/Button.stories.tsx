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
  argTypes: {
    children: { control: 'text' },
    variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'tertiary'] },
    radius: { control: { type: 'select' }, options: ['sharp', 'pill'] },
    iconOnly: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  args: {
    children: 'Button',
    variant: 'primary',
    radius: 'sharp',
    iconOnly: false,
    disabled: false,
  },
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** High-emphasis action. Use at most one primary button per view. */
export const Primary: Story = {
  args: { variant: 'primary' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button' });

    await expect(getComputedStyle(button).backgroundColor).toBe('rgb(41, 84, 154)');
  },
};

/** Medium emphasis — secondary actions placed alongside a primary button. */
export const Secondary: Story = {
  args: { variant: 'secondary' },
};

/** Low emphasis — tertiary or inline actions. */
export const Tertiary: Story = {
  args: { variant: 'tertiary' },
};

/** Pill-shaped corners (issue #73), one per variant. */
export const Rounded: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} variant="primary" radius="pill">
        Primary
      </Button>
      <Button {...args} variant="secondary" radius="pill">
        Secondary
      </Button>
      <Button {...args} variant="tertiary" radius="pill">
        Tertiary
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['Primary', 'Secondary', 'Tertiary']) {
      const button = canvas.getByRole('button', { name });
      await expect(getComputedStyle(button).borderRadius).toBe('9999px');
    }
  },
};

/** Default (sharp) corners stay unaffected when `radius` isn't set. */
export const RadiusDefaultsToSharp: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button' });

    await expect(getComputedStyle(button).borderRadius).toBe('0px');
  },
};

/** Pill corners persist on a disabled button. */
export const RoundedDisabled: Story = {
  args: { radius: 'pill', disabled: true },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="tertiary">
        Tertiary
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const name of ['Primary', 'Secondary', 'Tertiary']) {
      const button = canvas.getByRole('button', { name });
      await expect(getComputedStyle(button).borderRadius).toBe('9999px');
    }
  },
};

/** All three variants side by side, sharing the same control height (issue #79). */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="tertiary">
        Tertiary
      </Button>
    </div>
  ),
};

/** Disabled appearance for each variant. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} variant="primary">
        Primary
      </Button>
      <Button {...args} variant="secondary">
        Secondary
      </Button>
      <Button {...args} variant="tertiary">
        Tertiary
      </Button>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Figma's disabled label/icon color is `text/disabled` (#686872), not the
    // `Common/Disabled` (#c9c9ce) token used for the outlined variant's border.
    for (const name of ['Primary', 'Secondary', 'Tertiary']) {
      const button = canvas.getByRole('button', { name });
      await expect(getComputedStyle(button).color).toBe('rgb(104, 104, 114)');
    }
  },
};

/**
 * Figma splits horizontal/vertical padding across two different spacing tokens
 * (`spacing/medium` horizontal, `spacing/small` vertical) — they must differ.
 */
export const HorizontalPaddingExceedsVertical: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button' });
    const style = getComputedStyle(button);

    await expect(parseFloat(style.paddingLeft)).toBeGreaterThan(parseFloat(style.paddingTop));
  },
};

/** Figma's button label uses Semi-Bold weight, same override Chip's label uses. */
export const LabelIsSemiBold: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Button' });

    await expect(getComputedStyle(button).fontWeight).toBe('600');
  },
};

/** Leading TREDS icon. */
export const LeftIcon: Story = {
  render: (args) => (
    <Button {...args} leftIcon={<SearchIcon {...iconProps} />}>
      Search
    </Button>
  ),
};

/** Trailing TREDS icon. */
export const RightIcon: Story = {
  render: (args) => (
    <Button {...args} rightIcon={<ArrowRightIcon {...iconProps} />}>
      Next
    </Button>
  ),
};

/** Leading and trailing TREDS icons. */
export const BothIcons: Story = {
  render: (args) => (
    <Button
      {...args}
      leftIcon={<SearchIcon {...iconProps} />}
      rightIcon={<ArrowRightIcon {...iconProps} />}
    >
      Search Next
    </Button>
  ),
};

/**
 * Icon-only button (Figma's `Icon-only: Yes` variant) — uniform padding on all
 * sides instead of the wider horizontal padding a labeled button uses.
 * Always provide an aria-label for accessibility.
 */
export const WithoutText: Story = {
  render: (args) => (
    <Button {...args} iconOnly aria-label="Search">
      <SearchIcon {...iconProps} />
    </Button>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Search' });
    const style = getComputedStyle(button);

    await expect(style.paddingLeft).toBe(style.paddingTop);
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
