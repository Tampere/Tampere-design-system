import type { Meta, StoryObj } from '@storybook/react-vite';
// react hooks not required here; story state is managed via Storybook args
import { useArgs } from '@storybook/client-api';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';

import { Pagination } from './Pagination';

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
        getAriaLabelForButton={(pageIndex) =>
          `Page ${String(pageIndex + 1)} of ${String(args.pageCount)}`
        }
        pageCount={args.pageCount}
        maxVisiblePages={args.maxVisiblePages}
      />
    );
  },
};

export const ChevronsPointCorrectDirections: Story = {
  args: {
    pageCount: 5,
    activePageIndex: 2,
    onPageChange: () => {},
    leftButtonLabel: 'Previous',
    rightButtonLabel: 'Next',
  },
  render: (args) => <Pagination {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const leftPath = canvas.getByLabelText('Previous').querySelector('path') as SVGPathElement;
    const rightPath = canvas.getByLabelText('Next').querySelector('path') as SVGPathElement;

    // ChevronLeftIcon's path starts near the SVG's right edge (x≈15) curving
    // to a point at the left (x≈7); ChevronRightIcon is the mirror image.
    // Asserting on the raw path data pins the actual rendered glyph, not an
    // incidental CSS transform that happens to produce the same pixels.
    await expect(leftPath.getAttribute('d')).toContain('M15.207 20.207');
    await expect(rightPath.getAttribute('d')).toContain('M8.79297 3.79297');
  },
};
