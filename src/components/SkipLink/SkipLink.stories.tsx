import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { SkipLink } from './SkipLink';

const meta = {
  component: SkipLink,
  tags: ['!dev', '!autodocs'],
} satisfies Meta<typeof SkipLink>;

export default meta;
type Story = StoryObj<typeof meta>;

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
