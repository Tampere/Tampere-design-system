import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';
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

// an uncontrolled defaultValue must show and stay editable.
export const WithDefaultValue: Story = {
  args: { inputLabel: 'Additional information', defaultValue: 'Initial text' },
  render: (args) => <TextArea {...args} />,
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByLabelText('Additional information');
    await expect(textarea).toHaveValue('Initial text');
    await userEvent.type(textarea, '!');
    await expect(textarea).toHaveValue('Initial text!');
  },
};

// Mantine's label/description must render when inputLabel/helperText aren't set.
export const MantineLabelFallback: Story = {
  tags: ['!dev', '!autodocs'],
  args: { inputLabel: undefined, helperText: undefined, label: 'Notes', description: 'Optional' },
  render: (args) => <TextArea {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText('Notes');
    await expect(textarea).toHaveAccessibleName('Notes');
    await expect(textarea).toHaveAccessibleDescription('Optional');
  },
};

// An empty inputLabel/helperText counts as unset, so Mantine's label/description still apply.
export const EmptyPropsUseMantineFallback: Story = {
  tags: ['!dev', '!autodocs'],
  args: { inputLabel: '', helperText: '', label: 'Notes', description: 'Optional' },
  render: (args) => <TextArea {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText('Notes');
    await expect(textarea).toHaveAccessibleName('Notes');
    await expect(textarea).toHaveAccessibleDescription('Optional');
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
  render: (args) => <TextArea {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByLabelText('Primary');
    await expect(textarea).toHaveAccessibleName('Primary');
    await expect(textarea).not.toHaveAccessibleName('Fallback');
    await expect(textarea).toHaveAccessibleDescription('Primary help');
    await expect(textarea).not.toHaveAccessibleDescription('Fallback help');
  },
};

// the label must share TextField's semibold label style.
export const LabelWeight: Story = {
  tags: ['!dev', '!autodocs'],
  args: { inputLabel: 'Additional information' },
  render: (args) => <TextArea {...args} />,
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText('Additional information');
    await expect(getComputedStyle(label).fontWeight).toBe('600');
  },
};
