import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextArea } from './TextArea';

const meta = {
  component: TextArea,
  argTypes: {
    inputLabel: { control: 'text', description: 'Area label (visible)' },
    placeholder: { control: 'text', description: 'Placeholder text' },
    helperText: { control: 'text', description: 'Helper/description text' },
    error: { control: 'text', description: 'Error text (shows error state)' },
    disabled: { control: 'boolean' },
    required: { control: 'boolean' },
  },
  args: {
    inputLabel: 'Text area',
    placeholder: '',
    helperText: '',
    error: '',
    disabled: false,
    required: false,
  },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { inputLabel: 'Text area', placeholder: '' },
  render: (args) => <TextArea {...args} />,
};

export const WithPlaceholder: Story = {
  args: { inputLabel: 'Text area', placeholder: 'Enter text…' },
  render: (args) => <TextArea {...args} />,
};

export const Required: Story = {
  args: { inputLabel: 'Name', required: true, placeholder: 'Enter your name' },
  render: (args) => <TextArea {...args} />,
};

export const Disabled: Story = {
  args: { inputLabel: 'Disabled', disabled: true, placeholder: 'Cannot type' },
  render: (args) => <TextArea {...args} />,
};

export const WithError: Story = {
  args: { inputLabel: 'Email', error: 'Invalid email', placeholder: 'you@example.com' },
  render: (args) => <TextArea {...args} />,
};

export const WithHelperText: Story = {
  args: {
    inputLabel: 'Description',
    helperText: 'At least 8 characters',
    placeholder: 'Enter description',
  },
  render: (args) => <TextArea {...args} />,
};
