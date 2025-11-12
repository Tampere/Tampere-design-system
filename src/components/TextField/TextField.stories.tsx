import type { Meta, StoryObj } from '@storybook/react-vite';
import { TextField } from 'src/components';

const meta = {
  component: TextField,
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args) => <TextField {...args} />,
};
