import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from '@storybook/client-api';
import { Switch } from './Switch';

const meta = {
  component: Switch,
  argTypes: {
    checked: { control: 'boolean', description: 'Whether the switch is on' },
    label: { control: 'text', description: 'Visible label next to the switch' },
    ariaLabel: { control: 'text', description: 'Accessible aria-label for the input' },
    onChange: { action: 'changed' },
  },
  args: {
    checked: false,
    label: 'Enable feature',
    onChange: () => {},
    ariaLabel: '',
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// Note: Storybook preview hooks (useArgs) must be called inside story render functions
// or decorators — not inside child components. Each story below uses useArgs in
// its render function to keep Controls and the UI in sync.

export const Primary: Story = {
  args: { label: 'Enable feature', checked: false },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleChange = () => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
    };
    return (
      <div style={{ padding: 16 }}>
        <Switch {...args} checked={checked} onChange={handleChange} />
      </div>
    );
  },
};

export const Checked: Story = {
  args: { label: 'Enabled by default', checked: true },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleChange = () => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
    };
    return (
      <div style={{ padding: 16 }}>
        <Switch {...args} checked={checked} onChange={handleChange} />
      </div>
    );
  },
};

export const WithAriaLabelOnly: Story = {
  args: { ariaLabel: 'Toggle dark mode', checked: false },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleChange = () => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
    };
    return (
      <div style={{ padding: 16 }}>
        <Switch {...args} checked={checked} onChange={handleChange} />
      </div>
    );
  },
};
