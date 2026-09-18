import type { Meta, StoryObj } from '@storybook/react-vite';
import { userEvent, within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { SkipLink } from './SkipLink';

const meta = {
  component: SkipLink,
  tags: ['!dev', '!autodocs'],
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

export const HiddenByDefault: Story = {
  render: () => <SkipLink />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Hyppää pääsisältöön' });
    const rect = link.getBoundingClientRect();
    // Clipped to a 1px box, not display:none — it stays in the tab order.
    await expect(rect.width).toBeLessThanOrEqual(1);
    await expect(rect.height).toBeLessThanOrEqual(1);
    await expect(getComputedStyle(link).position).toBe('absolute');
  },
};

export const BecomesVisibleOnFocus: Story = {
  tags: docExample,
  parameters: {
    docs: {
      description: {
        story:
          'Visually hidden until keyboard focus; once focused, renders as a fixed, ' +
          'centered pill near the top of the viewport. Render SkipLink first in the ' +
          "document — before any other focusable element — for it to be the page's " +
          'first tab stop. Activating it moves focus to the fragment target named by ' +
          "`href` (default `'#main-content'`); if that element isn't already " +
          'focusable, SkipLink adds `tabindex="-1"` to it automatically.',
      },
    },
  },
  render: () => <SkipLink />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Hyppää pääsisältöön' }) as HTMLElement;
    // A direct .focus() call triggers :focus-visible in this Chromium test
    // harness — same technique LabeledIconButton.stories.tsx's
    // FocusVisibleHasBackgroundAndOutline story already relies on.
    link.focus();
    await expect(getComputedStyle(link).position).toBe('fixed');
    const rect = link.getBoundingClientRect();
    await expect(rect.width).toBeGreaterThan(50);
    // Figma's focus-visible outline, via the shared focusRing token.
    await expect(getComputedStyle(link).outlineStyle).toBe('solid');
  },
};

export const DefaultHrefTargetsMainContent: Story = {
  render: () => <SkipLink />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Hyppää pääsisältöön' });
    await expect(link).toHaveAttribute('href', '#main-content');
  },
};

export const HrefAndChildrenAreOverridable: Story = {
  render: () => <SkipLink href="#sisalto">Siirry sisältöön</SkipLink>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Siirry sisältöön' });
    await expect(link).toHaveAttribute('href', '#sisalto');
  },
};

export const IsFirstInTabOrder: Story = {
  render: () => (
    <>
      <SkipLink />
      <button type="button">Jokin muu</button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Reset focus to a neutral state, then Tab once — the first focusable
    // element in DOM order should be the skip link, not the button after it.
    (document.activeElement as HTMLElement | null)?.blur();
    await userEvent.tab();
    const link = canvas.getByRole('link', { name: 'Hyppää pääsisältöön' });
    await expect(document.activeElement).toBe(link);
  },
};

export const ActivatingMovesFocusToMainLandmark: Story = {
  render: () => (
    <>
      <SkipLink href="#main-content" />
      {/* tabIndex={-1}: makes a bare <main> a valid focus target. SkipLink
          also sets this automatically if a consumer forgets it — see
          MovesFocusEvenWithoutExplicitTabIndex below — but setting it
          explicitly here keeps this story's own intent obvious. */}
      <main id="main-content" tabIndex={-1}>
        Sisältö
      </main>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Hyppää pääsisältöön' });
    // Prevents the real fragment navigation the browser performs on click —
    // in this Storybook/vitest-browser-mode harness that navigation crashes
    // the runner's connection to the page (a harness limitation, not
    // something the component does; SkipLink itself never calls
    // preventDefault). This isolates the test to the onClick handler's
    // focus-management effect.
    link.addEventListener('click', (e) => e.preventDefault());
    await userEvent.click(link);
    const main = canvas.getByRole('main');
    await expect(document.activeElement).toBe(main);
  },
};

export const MovesFocusEvenWithoutExplicitTabIndex: Story = {
  render: () => (
    <>
      <SkipLink href="#content" />
      <main id="content">Sisältö</main>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Hyppää pääsisältöön' });
    // See ActivatingMovesFocusToMainLandmark above for why this is needed in
    // this test harness.
    link.addEventListener('click', (e) => e.preventDefault());
    await userEvent.click(link);
    const main = canvas.getByRole('main');
    await expect(document.activeElement).toBe(main);
    await expect(main).toHaveAttribute('tabindex', '-1');
  },
};

export const DoesNotThrowWhenTargetIsMissing: Story = {
  render: () => <SkipLink href="#does-not-exist" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Hyppää pääsisältöön' });
    link.addEventListener('click', (e) => e.preventDefault());
    await userEvent.click(link);
    // No target to move focus to — clicking is a safe no-op, focus stays put.
    await expect(document.activeElement).toBe(link);
  },
};
