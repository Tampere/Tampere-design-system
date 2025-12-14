import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from '@storybook/client-api';
import { RadioButton } from './RadioButton';

const meta: Meta<typeof RadioButton> = {
  argTypes: {
    id: { control: 'text' },
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    error: { control: 'boolean' },
    onChange: { action: 'changed' },
  },
  args: {
    label: 'Label',
    checked: false,
    disabled: false,
    error: false,
  },
  component: RadioButton,
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'Option 1' },
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
    return <RadioButton {...args} checked={checked} onClick={handleClick} />;
  },
};

export const Checked: Story = {
  args: { label: 'Selected option', checked: true },
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
    return <RadioButton {...args} checked={checked} onClick={handleClick} />;
  },
};

export const Disabled: Story = {
  args: { label: 'Disabled option', disabled: true },
  render: (args) => <RadioButton {...args} />,
};

export const Error: Story = {
  args: { label: 'Option with error', error: true },
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
    return <RadioButton {...args} checked={checked} onClick={handleClick} />;
  },
};

export const RadioGroup: Story = {
  render: () => {
    const [selected, setSelected] = useArgs();
    const selectedValue = selected.selected || 'option1';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <RadioButton
          label="Option 1"
          checked={selectedValue === 'option1'}
          onClick={() => setSelected({ selected: 'option1' })}
        />
        <RadioButton
          label="Option 2"
          checked={selectedValue === 'option2'}
          onClick={() => setSelected({ selected: 'option2' })}
        />
        <RadioButton
          label="Option 3"
          checked={selectedValue === 'option3'}
          onClick={() => setSelected({ selected: 'option3' })}
        />
        <RadioButton label="Disabled option" disabled checked={false} />
      </div>
    );
  },
};
