import type { Meta, StoryObj } from '@storybook/react-vite';
// storybook/test's `expect` is a standalone chai-based assertion object with
// no snapshot plugin wired in, so `toMatchSnapshot` throws "Invalid Chai
// property" when called on it. Vitest's own `expect` is bound to the running
// test's snapshot state and is required here; there is no DOM interaction in
// this test for the storybook-specific expect helpers to add value to anyway.
import { expect } from 'vitest';
import { getTheme } from '.';
// Internal implementation detail, not part of the public barrel — imported
// directly the same way theme.css.ts does, rather than re-exporting it.
import { BREAKPOINT_KEYS_WIDEST_FIRST } from './tokens/breakpoint';

const meta = {
  title: 'Theme/Token regression',
} satisfies Meta<{}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TokenValuesMatchSnapshot: Story = {
  // Test-only: carries a `play` assertion, not documentation, so it's hidden
  // from the sidebar (`!dev`) and autodocs page (`!autodocs`).
  tags: ['!dev', '!autodocs'],
  // Guards against silent token-value drift in src/theme/tokens/*.ts: no
  // other test reads the raw getTheme(bp) object across all six
  // breakpoints, so an accidental edit there could otherwise ship with
  // zero automated signal (see PR #99 review). Any real value change must
  // regenerate this snapshot, which is exactly the reviewer checkpoint
  // this test exists to force.
  render: () => <></>,
  play: async () => {
    for (const bp of BREAKPOINT_KEYS_WIDEST_FIRST) {
      // eslint-disable-next-line storybook/use-storybook-expect -- see import comment above
      await expect(getTheme(bp)).toMatchSnapshot(bp);
    }
  },
};
