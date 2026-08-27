import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select } from './Select';

const meta = {
  argTypes: {
    inputLabel: { control: 'text' },
    placeholder: { control: 'text' },
    options: { control: 'object' },
    required: { control: 'boolean' },
    error: { control: 'text' },
    disabled: { control: 'boolean' },
    helperText: { control: 'text' },
    noResultsMessage: { control: 'text' },
    onChange: { action: 'changed' },
  },
  args: {
    inputLabel: 'Select',
    placeholder: '',
    options: ['Option 1', 'Option 2'],
    required: false,
    error: '',
    disabled: false,
    helperText: '',
    noResultsMessage: '',
  },
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    inputLabel: 'Hedelmävalinta',
    placeholder: 'Valitse hedelmä...',
    options: ['Omena', 'Banaani', 'Appelsiini', 'Mango'],
    required: false,
    error: '',
    disabled: false,
    helperText: 'Ohjeteksti tähän',
    noResultsMessage: 'Ei hakutuloksia',
  },
  render: (args) => <Select {...args} />,
};
