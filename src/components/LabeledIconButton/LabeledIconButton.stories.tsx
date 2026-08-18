import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { LabeledIconButton } from './LabeledIconButton';
import { AddIcon } from '../../icons/AddIcon';

const meta = {
  argTypes: {
    icon: { control: false },
    label: { control: 'text' },
    variant: { control: { type: 'select' }, options: ['light', 'dark'] },
    disabled: { control: 'boolean' },
  },
  args: {
    icon: <AddIcon />,
    label: 'Label',
    variant: 'light',
    disabled: false,
  },
  component: LabeledIconButton,
} satisfies Meta<typeof LabeledIconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} />,
};

export const Disabled: Story = {
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} disabled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Label' });
    await expect(button).toBeDisabled();
  },
};

export const RendersLabelText: Story = {
  tags: ['!dev', '!autodocs'],
  render: (args) => <LabeledIconButton {...args} icon={<AddIcon />} label="Favorite" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Favorite')).toBeInTheDocument();
  },
};
