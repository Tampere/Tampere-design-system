import type { Meta, StoryObj } from '@storybook/react-vite';
// react hooks not required here; story state is managed via Storybook args
import { useArgs } from '@storybook/client-api';
import { TextField } from 'src/components';

const meta = {
  component: TextField,
  argTypes: {
    size: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl'] },
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
    size: 'md',
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

export const SizeSmall: Story = {
  args: { inputLabel: 'Small', size: 'sm', placeholder: 'Small input' },
  render: (args) => <TextField {...args} />,
};

export const SizeLarge: Story = {
  args: { inputLabel: 'Large', size: 'lg', placeholder: 'Large input' },
  render: (args) => <TextField {...args} />,
};
