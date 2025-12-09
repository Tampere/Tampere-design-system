import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from './Button';
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
