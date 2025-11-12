import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from '@storybook/client-api';
import { Checkbox } from './Checkbox';

const meta = {
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
  args: {
    label: 'Label',
    checked: false,
    disabled: false,
  },
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'I agree to the terms' },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: any) => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
      // preserve original onClick if provided
      try {
        (args as any).onClick?.(e);
      } catch {}
    };
    return <Checkbox {...args} checked={checked} onClick={handleClick} />;
  },
};

export const Checked: Story = {
  args: { label: 'Checked option', checked: true },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: any) => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
      try {
        (args as any).onClick?.(e);
      } catch {}
    };
    return <Checkbox {...args} checked={checked} onClick={handleClick} />;
  },
};

export const Disabled: Story = {
  args: { label: 'Disabled option', disabled: true },
  render: (args) => <Checkbox {...args} />,
};

export const RichLabel: Story = {
  args: {
    label: (
      <span>
        Accept <strong>all</strong> cookies
      </span>
    ),
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: any) => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
      try {
        (args as any).onClick?.(e);
      } catch {}
    };
    return <Checkbox {...args} checked={checked} onClick={handleClick} />;
  },
};
