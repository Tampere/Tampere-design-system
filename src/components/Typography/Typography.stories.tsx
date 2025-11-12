import type { Meta, StoryObj } from '@storybook/react-vite';
import { Typography } from './Typography';

const variants = ['h1', 'h2', 'h3', 'h4', 'h5', 'subheader', 'p1', 'p2'] as const;
const components = ['span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5'] as const;

const meta = {
  component: Typography,
  argTypes: {
    variant: { control: { type: 'select' }, options: variants },
    component: { control: { type: 'select' }, options: components },
    children: { control: 'text' },
  },
  args: {
    variant: 'p1',
    children: 'Example text',
  },
} satisfies Meta<typeof Typography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const H1: Story = {
  args: { variant: 'h1', children: 'Heading 1 — Example' },
};

export const H2: Story = {
  args: { variant: 'h2', children: 'Heading 2 — Example' },
};

export const H3: Story = {
  args: { variant: 'h3', children: 'Heading 3 — Example' },
};

export const H4: Story = {
  args: { variant: 'h4', children: 'Heading 4 — Example' },
};

export const H5: Story = {
  args: { variant: 'h5', children: 'Heading 5 — Example' },
};

export const Subheader: Story = {
  args: { variant: 'subheader', children: 'Subheader text example' },
};

export const P1: Story = {
  args: { variant: 'p1', children: 'Paragraph 1 — body text example' },
};

export const P2: Story = {
  args: { variant: 'p2', children: 'Paragraph 2 — secondary text example' },
};
