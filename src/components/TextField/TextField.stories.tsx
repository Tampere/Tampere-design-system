import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from '@storybook/client-api';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { TextField } from './TextField';

const meta = {
  component: TextField,
  argTypes: {
    inputLabel: { control: 'text', description: 'Input label (visible)' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    helperText: { control: 'text', description: 'Helper/description text' },
    error: { control: 'text', description: 'Error text (shows error state)' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
    showSearchIcon: { control: 'boolean', description: 'Show left search icon' },
    showClearButton: { control: 'boolean', description: 'Show clear button when non-empty' },
    clearButtonLabel: { control: 'text', description: 'aria-label for clear button' },
  },
  args: {
    inputLabel: 'Text input',
    placeholder: '',
    helperText: '',
    error: '',
    disabled: false,
    required: false,
    showSearchIcon: false,
    showClearButton: false,
    clearButtonLabel: 'Clear',
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { inputLabel: 'Text input', placeholder: '' },
  render: (args) => <TextField {...args} />,
};

export const WithPlaceholder: Story = {
  args: { inputLabel: 'Search', placeholder: 'Search…' },
  render: (args) => <TextField {...args} />,
};

export const Required: Story = {
  args: { inputLabel: 'Name', required: true, placeholder: 'Enter your name' },
  render: (args) => <TextField {...args} />,
};

export const Disabled: Story = {
  args: { inputLabel: 'Disabled', disabled: true, placeholder: 'Cannot type' },
  render: (args) => <TextField {...args} />,
};

export const WithError: Story = {
  args: { inputLabel: 'Email', error: 'Invalid email', placeholder: 'you@example.com' },
  render: (args) => <TextField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByPlaceholderText('you@example.com');
    // Figma Common/Error = Red/300 (#ae1e20), reached via the shared theme.states.error token.
    await expect(getComputedStyle(input).borderColor).toBe('rgb(174, 30, 32)');
  },
};

export const WithHelperText: Story = {
  args: { inputLabel: 'Password', helperText: 'At least 8 characters', placeholder: '••••••••' },
  render: (args) => <TextField {...args} />,
};

export const WithSearchIcon: Story = {
  args: { inputLabel: 'Search', placeholder: 'Search…', showSearchIcon: true },
  render: (args) => <TextField {...args} />,
};

export const WithClearButton: Story = {
  render: () => {
    const [args, updateArgs] = useArgs();
    const value = args.value ?? '';
    return (
      <TextField
        inputLabel="Clearable"
        showClearButton
        value={value}
        onChange={(e) => updateArgs({ value: e.currentTarget.value })}
        onClearButtonClick={() => updateArgs({ value: '' })}
      />
    );
  },
};

export const Controlled: Story = {
  render: () => {
    const [args, updateArgs] = useArgs();
    const value = args.value ?? 'Controlled value';
    return (
      <TextField
        inputLabel="Controlled"
        value={value}
        onChange={(e) => updateArgs({ value: e.currentTarget.value })}
        placeholder="Type here"
      />
    );
  },
};

// an uncontrolled defaultValue must show, stay editable, and clear.
export const WithDefaultValue: Story = {
  args: { inputLabel: 'Start date', defaultValue: '1.6.2026', showClearButton: true },
  render: (args) => <TextField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Start date');
    await expect(input).toHaveValue('1.6.2026');
    await userEvent.type(input, '7');
    await expect(input).toHaveValue('1.6.20267');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
  },
};

// Mantine's label/description must render when inputLabel/helperText aren't set.
export const MantineLabelFallback: Story = {
  tags: ['!dev', '!autodocs'],
  args: { inputLabel: undefined, helperText: undefined, label: 'Name', description: 'Full name' },
  render: (args) => <TextField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Name');
    await expect(input).toHaveAccessibleName('Name');
    await expect(input).toHaveAccessibleDescription('Full name');
  },
};

// An empty inputLabel/helperText counts as unset, so Mantine's label/description still apply.
export const EmptyPropsUseMantineFallback: Story = {
  tags: ['!dev', '!autodocs'],
  args: { inputLabel: '', helperText: '', label: 'Name', description: 'Full name' },
  render: (args) => <TextField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Name');
    await expect(input).toHaveAccessibleName('Name');
    await expect(input).toHaveAccessibleDescription('Full name');
  },
};

// When both are set, inputLabel/helperText must win over Mantine's label/description.
export const PropsWinOverMantineFallback: Story = {
  tags: ['!dev', '!autodocs'],
  args: {
    inputLabel: 'Primary',
    helperText: 'Primary help',
    label: 'Fallback',
    description: 'Fallback help',
  },
  render: (args) => <TextField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Primary');
    await expect(input).toHaveAccessibleName('Primary');
    await expect(input).not.toHaveAccessibleName('Fallback');
    await expect(input).toHaveAccessibleDescription('Primary help');
    await expect(input).not.toHaveAccessibleDescription('Fallback help');
  },
};

// A numeric defaultValue must count as non-empty, so the clear button shows and clears it (#200).
export const NumericDefaultValue: Story = {
  tags: ['!dev', '!autodocs'],
  args: { inputLabel: 'Amount', defaultValue: 123, showClearButton: true },
  render: (args) => <TextField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Amount');
    await expect(input).toHaveValue('123');
    await userEvent.click(canvas.getByRole('button', { name: 'Clear' }));
    await expect(input).toHaveValue('');
  },
};

// A numeric controlled value must count as non-empty, so the clear button shows (#200).
export const NumericControlledValue: Story = {
  tags: ['!dev', '!autodocs'],
  args: { inputLabel: 'Amount', value: 123, showClearButton: true },
  render: (args) => <TextField {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByLabelText('Amount')).toHaveValue('123');
    await expect(canvas.getByRole('button', { name: 'Clear' })).toBeInTheDocument();
  },
};

export const SizeSmall: Story = {
  args: { inputLabel: 'Small', size: 'sm', placeholder: 'Small input' },
  render: (args) => <TextField {...args} />,
};

export const SizeLarge: Story = {
  args: { inputLabel: 'Large', size: 'lg', placeholder: 'Large input' },
  render: (args) => <TextField {...args} />,
};

export const ForwardsRefToInput: Story = {
  // Test-only: this exercises ref forwarding, not a visual example — keep it
  // off TextField's public docs page (unlike the rest of this file, whose
  // stories are all genuine visual examples).
  tags: ['!dev', '!autodocs'],
  render: function Render(args) {
    const ref = useRef<HTMLInputElement>(null);
    const [tag, setTag] = useState('none');
    return (
      <>
        <TextField {...args} ref={ref} inputLabel="Ref test" />
        <button type="button" onClick={() => setTag(ref.current?.tagName ?? 'null')}>
          read ref
        </button>
        <span data-testid="ref-tag">{tag}</span>
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'read ref' }));
    // The ref must land on the <input>, not on a wrapper div.
    await expect(canvas.getByTestId('ref-tag')).toHaveTextContent('INPUT');
  },
};
