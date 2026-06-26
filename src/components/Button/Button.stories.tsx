import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Button } from './Button';
import { TextField } from '../TextField';
import { Select } from '../Select';
import { SearchIcon } from '../../icons/SearchIcon';
import { ArrowRightIcon } from '../../icons/ArrowRightIcon';
import { vars } from '../../theme';

// Size in-button icons with the design-system icon.size token (20px, matching the
// button line-height) rather than an emoji or a hardcoded value.
const iconSize = vars.components.icon.size.medium;
const iconProps = { style: { width: iconSize, height: iconSize } };

const meta = {
  argTypes: {
    children: { control: 'text' },
    variant: { control: { type: 'select' }, options: ['filled', 'outlined', 'text'] },
    disabled: { control: 'boolean' },
    onClick: { action: 'clicked' },
  },
  args: {
    children: 'Button',
    variant: 'filled',
    disabled: false,
  },
  component: Button,
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/** High-emphasis, primary action. Use at most one filled button per view. */
export const Filled: Story = {
  args: { variant: 'filled' },
};

/** Medium emphasis — secondary actions placed alongside a filled button. */
export const Outlined: Story = {
  args: { variant: 'outlined' },
};

/** Low emphasis — tertiary or inline actions. */
export const Text: Story = {
  args: { variant: 'text' },
};

/** All three variants side by side, sharing the same control height (issue #79). */
export const Variants: Story = {
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} variant="filled">
        Filled
      </Button>
      <Button {...args} variant="outlined">
        Outlined
      </Button>
      <Button {...args} variant="text">
        Text
      </Button>
    </div>
  ),
};

/** Disabled appearance for each variant. */
export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <Button {...args} variant="filled">
        Filled
      </Button>
      <Button {...args} variant="outlined">
        Outlined
      </Button>
      <Button {...args} variant="text">
        Text
      </Button>
    </div>
  ),
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

/** Icon-only button. Always provide an aria-label for accessibility. */
export const WithoutText: Story = {
  render: (args) => (
    <Button {...args} aria-label="Search">
      <SearchIcon {...iconProps} />
    </Button>
  ),
};

/**
 * All single-line controls (button variants, text input, select) must render at the
 * same shared, responsive control height — borders absorbed via box-sizing (issue #79).
 */
export const ControlHeightConsistency: Story = {
  render: () => (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
      <Button variant="filled">Filled</Button>
      <Button variant="outlined">Outlined</Button>
      <Button variant="text">Text</Button>
      <TextField inputLabel="Text input" placeholder="Input" />
      <Select inputLabel="Select picker" options={['One', 'Two']} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const filled = canvas.getByRole('button', { name: 'Filled' });
    const outlined = canvas.getByRole('button', { name: 'Outlined' });
    const text = canvas.getByRole('button', { name: 'Text' });
    const textInput = canvas.getByRole('textbox', { name: 'Text input' });
    const selectInput = canvas.getByRole('textbox', { name: 'Select picker' });

    const heightOf = (el: Element) => Math.round(el.getBoundingClientRect().height);
    const reference = heightOf(filled);

    // Filled is the design source of truth; every other control must match it exactly.
    await expect(reference).toBeGreaterThan(0);
    await expect(heightOf(outlined)).toBe(reference);
    await expect(heightOf(text)).toBe(reference);
    await expect(heightOf(textInput)).toBe(reference);
    await expect(heightOf(selectInput)).toBe(reference);
  },
};
