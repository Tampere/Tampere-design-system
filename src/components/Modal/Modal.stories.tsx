import type { Meta, StoryObj } from '@storybook/react-vite';
// react hooks not required here; story state is managed via Storybook args
import { useArgs } from '@storybook/client-api';
import { Modal } from './Modal';
import { Button } from 'src/components/Button/Button';

const meta = {
  argTypes: {
    title: { control: 'text' },
    children: { control: 'text' },
    size: { control: { type: 'select' }, options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    opened: { control: 'boolean' },
    onClose: { action: 'closed' },
  },
  args: {
    title: 'Modal title',
    children: 'Modal content',
    size: 'md',
    opened: false,
    onClose: () => {},
  },
  component: Modal,
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Modal title',
    children: <div>Modal content goes here.</div>,
    opened: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const opened = Boolean(args.opened);
    return (
      <>
        <Button onClick={() => updateArgs({ opened: true })}>Open modal</Button>
        <Modal
          {...args}
          opened={opened}
          onClose={() => {
            updateArgs({ opened: false });
            try {
              (args as any).onClose?.();
            } catch {}
          }}
        >
          {args.children}
        </Modal>
      </>
    );
  },
};

export const Large: Story = {
  args: {
    title: 'Large modal',
    size: 'lg',
    children: (
      <div>
        <p>Large modal content.</p>
        <p>More content to show larger size.</p>
      </div>
    ),
    opened: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const opened = Boolean(args.opened);
    return (
      <>
        <Button onClick={() => updateArgs({ opened: true })}>Open modal</Button>
        <Modal
          {...args}
          opened={opened}
          onClose={() => {
            updateArgs({ opened: false });
            try {
              (args as any).onClose?.();
            } catch {}
          }}
        >
          {args.children}
        </Modal>
      </>
    );
  },
};

export const WithoutTitle: Story = {
  args: {
    title: undefined,
    children: <div>Modal without title.</div>,
    opened: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const opened = Boolean(args.opened);
    return (
      <>
        <Button onClick={() => updateArgs({ opened: true })}>Open modal</Button>
        <Modal
          {...args}
          opened={opened}
          onClose={() => {
            updateArgs({ opened: false });
            try {
              (args as any).onClose?.();
            } catch {}
          }}
        >
          {args.children}
        </Modal>
      </>
    );
  },
};

export const WithFooter: Story = {
  args: {
    title: 'With footer',
    children: (
      <div>
        <p>Modal body</p>
        <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
          <Button variant="outlined">Cancel</Button>
          <Button>Confirm</Button>
        </div>
      </div>
    ),
    opened: false,
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const opened = Boolean(args.opened);
    return (
      <>
        <Button onClick={() => updateArgs({ opened: true })}>Open modal</Button>
        <Modal
          {...args}
          opened={opened}
          onClose={() => {
            updateArgs({ opened: false });
            try {
              (args as any).onClose?.();
            } catch {}
          }}
        >
          {args.children}
        </Modal>
      </>
    );
  },
};
