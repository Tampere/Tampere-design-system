import type { Meta, StoryObj } from '@storybook/react-vite';
// storybook/test's `expect` is a standalone chai-based assertion object with
// no snapshot plugin wired in, so `toMatchSnapshot` throws "Invalid Chai
// property" when called on it. Vitest's own `expect` is bound to the running
// test's snapshot state and is required here; there is no DOM interaction in
// this test for the storybook-specific expect helpers to add value to anyway.
import { expect } from 'vitest';
import { page } from 'vitest/browser';
import { getTheme, themeVariables, vars } from '.';
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
    // Also snapshot themeVariables itself: which breakpoint the :root theme
    // is pinned to (currently 'md'), plus the primitives/brand tiers and
    // breakpoint.*.appWidth, none of which the per-breakpoint loop above
    // touches (see PR #99 review).
    // eslint-disable-next-line storybook/use-storybook-expect -- see import comment above
    await expect(themeVariables).toMatchSnapshot('themeVariables');
  },
};

export const ResponsiveCssMatchesBreakpoint: Story = {
  tags: ['!dev', '!autodocs'],
  // The snapshot above only proves the raw getTheme(bp) *data* is correct — it
  // never touches the media-query wiring in theme.css.ts that decides which
  // breakpoint's data actually lands on `:root` at a given viewport width
  // (that logic was rewritten in PR #99 and had zero runtime coverage — see
  // PR #99 review). This resizes the real browser viewport and reads back
  // resolved CSS so a wrong min/max pairing or off-by-one in `mediaQueryFor`
  // fails here instead of shipping silently.
  render: () => <></>,
  play: async () => {
    const probe = document.createElement('div');
    document.body.appendChild(probe);
    probe.style.fontSize = vars.theme.components.typography.h1.fontSize;
    probe.style.minWidth = vars.theme.components.footer.columnMinWidth;

    try {
      // [viewport width comfortably inside the breakpoint's range, expected
      // h1 font-size, expected footer column min-width] — widths are chosen
      // away from exact boundaries, which is a separate tie-break concern.
      const cases: Array<[number, string, string]> = [
        [300, '28px', '280px'], // xs
        [400, '28px', '300px'], // sm
        [600, '32px', '550px'], // md
        [900, '36px', '680px'], // lg
        [1300, '40px', '768px'], // xl
        [2200, '40px', '768px'], // xxl
      ];

      for (const [width, expectedH1FontSize, expectedFooterMinWidth] of cases) {
        await page.viewport(width, 800);
        // eslint-disable-next-line storybook/use-storybook-expect -- see import comment above
        await expect(getComputedStyle(probe).fontSize).toBe(expectedH1FontSize);
        // eslint-disable-next-line storybook/use-storybook-expect -- see import comment above
        await expect(getComputedStyle(probe).minWidth).toBe(expectedFooterMinWidth);
      }
    } finally {
      probe.remove();
      await page.viewport(1280, 720);
    }
  },
};
