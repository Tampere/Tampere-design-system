import type { Meta, StoryObj } from '@storybook/react-vite';
import { useArgs } from '@storybook/client-api';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Modal } from './Modal';
import { Button } from '../Button';

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
    closeButtonProps: { 'aria-label': 'Close modal' },
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

export const CloseButtonHasAccessibleName: Story = {
  // Test-only: carries a `play` assertion, not documentation, so it's hidden
  // from the sidebar (`!dev`) and autodocs page (`!autodocs`).
  tags: ['!dev', '!autodocs'],
  // Regression test for #94: closeButtonProps had no fallback aria-label, so
  // a consumer that omitted it shipped a close button with no accessible
  // name — an axe-critical button-name violation. Rendered already-`opened`
  // (rather than toggled via a click) to avoid depending on Mantine's
  // mount/transition timing.
  args: {
    title: 'Modal title',
    children: 'Modal content',
    opened: true,
    closeButtonProps: { 'aria-label': 'Close modal' },
    onClose: () => {},
  },
  play: async () => {
    const body = within(document.body);
    const closeButton = await body.findByRole('button', { name: 'Close modal' });
    await expect(closeButton).toBeInTheDocument();
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
    closeButtonProps: { 'aria-label': 'Close modal' },
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
    closeButtonProps: { 'aria-label': 'Close modal' },
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
          <Button variant="secondary">Cancel</Button>
          <Button>Confirm</Button>
        </div>
      </div>
    ),
    opened: false,
    closeButtonProps: { 'aria-label': 'Close modal' },
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
