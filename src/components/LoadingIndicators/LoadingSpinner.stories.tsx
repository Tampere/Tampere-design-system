import type { Meta, StoryObj } from '@storybook/react-vite';
import { LoadingSpinner } from './LoadingIndicators';

const meta = {
  argTypes: {
    size: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    style: { control: 'object' },
  },
  args: {
    size: 'md',
    style: {},
  },
  component: LoadingSpinner,
} satisfies Meta<typeof LoadingSpinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
  render: (args) => <LoadingSpinner {...args} />,
};

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => <LoadingSpinner {...args} />,
};

export const Large: Story = {
  args: { size: 'lg' },
  render: (args) => <LoadingSpinner {...args} />,
};

export const Colored: Story = {
  args: { style: { color: '#0055aa' } },
  render: (args) => <LoadingSpinner {...args} />,
};
