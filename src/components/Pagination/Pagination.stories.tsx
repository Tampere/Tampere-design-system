import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { Pagination } from "@treds";

const meta = {
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
    const [activePageIndex, setActivePageIndex] = useState(0);

    return (
      <Pagination
        activePageIndex={activePageIndex}
        onPageChange={(idx) => {
          setActivePageIndex(idx);
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
