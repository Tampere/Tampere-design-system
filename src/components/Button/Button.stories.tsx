import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, expect } from 'storybook/test';
import { Button } from './Button';
import { TextField } from '../TextField';
import { Select } from '../Select';
import { SearchIcon } from '../../icons/SearchIcon';

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

export const Primary: Story = {
  render: (args) => <Button {...args}>Dark Button</Button>,
};

export const LeftIcon: Story = {
  render: (args) => (
    <Button {...args} leftIcon={<span>🔍</span>}>
      Search
    </Button>
  ),
};

export const RightIcon: Story = {
  render: (args) => (
    <Button {...args} rightIcon={<span>➡️</span>}>
      Next
    </Button>
  ),
};

export const BothIcons: Story = {
  render: (args) => (
    <Button {...args} leftIcon={<span>🚀</span>} rightIcon={<span>🚀</span>}>
      Search Next
    </Button>
  ),
};

export const WithSvgIcon: Story = {
  render: (args) => (
    <Button {...args} leftIcon={<SearchIcon />}>
      SVG Icon
    </Button>
  ),
};

export const WithoutText: Story = {
  render: (args) => (
    <Button {...args} aria-label="Magnifier">
      <SearchIcon />
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
