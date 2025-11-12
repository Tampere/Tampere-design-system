import type { Meta, StoryObj } from '@storybook/react-vite';
// react hooks not required here; story state is managed via Storybook args
import { useArgs } from '@storybook/client-api';

import { Pagination } from '@treds';

const meta = {
  argTypes: {
    pageCount: { control: 'number' },
    activePageIndex: { control: 'number' },
    maxVisiblePages: { control: 'number' },
    onPageChange: { action: 'changed' },
  },
  args: {
    pageCount: 5,
    activePageIndex: 0,
    maxVisiblePages: 5,
  },
  component: Pagination,
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    pageCount: 5,
    activePageIndex: 0,
    onPageChange: () => {},
    maxVisiblePages: 5,
  },

  render: (args) => {
    const [storyArgs, updateArgs] = useArgs();
    const activePageIndex = storyArgs.activePageIndex ?? 0;

    return (
      <Pagination
        activePageIndex={activePageIndex}
        onPageChange={(idx) => {
          updateArgs({ activePageIndex: idx });
        }}
        getAriaLabelForButton={(pageIndex) => `Page ${String(pageIndex + 1)} of ${String(args.pageCount)}`}
        pageCount={args.pageCount}
        maxVisiblePages={args.maxVisiblePages}
      />
    );
  },
};
