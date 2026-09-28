import type { Meta, StoryObj } from '@storybook/react-vite';
import { NavigationLink } from './NavigationLink';
import { Flex, Stack, UnstyledButton } from '@mantine/core';
import { within, expect, waitFor } from 'storybook/test';
import { SearchIcon } from '../../icons/SearchIcon';
import { CartIcon } from '../../icons/CartIcon';
import { iconWrapper } from './NavigationLink.css';
import { TextLink } from '../TextLink/TextLink';

// childNodes (not children) so the label's bare text node is comparable
// against an icon wrapper span's position — `children` only lists elements.
function childNodeIndex(parent: HTMLElement, node: Node | null) {
  return Array.from(parent.childNodes).indexOf(node as ChildNode);
}
function labelTextNodeIndex(parent: HTMLElement, text: string) {
  return Array.from(parent.childNodes).findIndex(
    (node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === text
  );
}

const meta = {
  component: NavigationLink,
  argTypes: {
    isSelected: {
      control: 'boolean',
      description: 'Whether the link is in a selected/active state',
    },
    href: {
      control: 'text',
      description: 'Link destination URL',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'inverted'],
      description: 'Visual variant of the link',
    },
    size: {
      control: { type: 'select' },
      options: ['md', 'sm'],
      description: 'Size of the link',
    },
    children: { control: 'text', description: 'Link text or children' },
    onClick: { action: 'clicked' },
  },
  args: {
    href: '#',
    children: 'Navigointilinkki',
    isSelected: false,
    variant: 'default',
    size: 'md',
  },
} satisfies Meta<typeof NavigationLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: '#',
    children: 'Navigointilinkki',
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    href: '#',
    children: 'Navigointilinkki',
    isSelected: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <Stack gap="lg">
      <Flex gap="xl">
        <Stack gap="md">
          <h3>Medium</h3>
          <NavigationLink href="#">Navigointilinkki</NavigationLink>
          <NavigationLink href="#" isSelected>
            Navigointilinkki
          </NavigationLink>
        </Stack>

        <Stack gap="md">
          <h3>Small</h3>
          <NavigationLink href="#" size="sm">
            Navigointilinkki
          </NavigationLink>
          <NavigationLink href="#" size="sm" isSelected>
            Navigointilinkki
          </NavigationLink>
        </Stack>
      </Flex>

      <div style={{ background: '#0056A6', padding: '20px' }}>
        <h3 style={{ color: 'white' }}>Inverted Color</h3>
        <Flex gap="xl">
          <NavigationLink href="#" variant="inverted">
            Navigointilinkki
          </NavigationLink>
          <NavigationLink href="#" isSelected variant="inverted">
            Navigointilinkki
          </NavigationLink>
        </Flex>
      </div>
    </Stack>
  ),
};

export const WithIcons: Story = {
  // Figma node 3992:2329's showStartIcon/showEndIcon variants — used e.g. by
  // AppHeader's collapsed-menu Actions section (search/cart), node 14187:18169.
  render: () => (
    <Stack gap="md">
      <NavigationLink href="#" startIcon={<SearchIcon />}>
        Haku
      </NavigationLink>
      <NavigationLink href="#" startIcon={<CartIcon />}>
        Ostoskori (0)
      </NavigationLink>
      <NavigationLink href="#" size="sm" endIcon={<CartIcon />}>
        Ostoskori (0)
      </NavigationLink>
    </Stack>
  ),
};

export const AsLinkOrAsButton: Story = {
  // Same look, two different underlying elements: a real destination gets an
  // `<a href>` (the default render); a stateful trigger (opens a cart
  // drawer, no navigation) uses `renderLink` to render a `<button>` instead.
  // `startIcon` is still passed on the button variant even though
  // `renderLink` skips NavigationLink's own icon rendering — it's what puts
  // the icon/gap layout class into the `className` renderLink receives, so
  // the hand-built icon markup lines up the same way. `UnstyledButton` (not
  // a plain `<button>`) is what strips the browser's native button chrome —
  // NavigationLink's own classes only add link typography/hover, they don't
  // reset an arbitrary element to look unstyled.
  render: () => (
    <Stack gap="md">
      <div>
        <h3>Link (navigates to a destination)</h3>
        <NavigationLink href="/ostoskori" startIcon={<CartIcon />}>
          Ostoskori (0)
        </NavigationLink>
      </div>
      <div>
        <h3>Button (opens something in place, e.g. a cart drawer)</h3>
        <NavigationLink
          startIcon={<CartIcon />}
          renderLink={(className) => (
            <UnstyledButton className={className} onClick={() => {}}>
              <span className={iconWrapper}>
                <CartIcon />
              </span>
              Ostoskori (0)
            </UnstyledButton>
          )}
        />
      </div>
    </Stack>
  ),
};

export const WithCustomLink: Story = {
  render: () => (
    <Stack gap="md">
      <h3>With Custom Component as Link</h3>
      <NavigationLink
        renderLink={(className) => {
          return (
            <a href="#custom" className={className}>
              Custom Link Component
            </a>
          );
        }}
      />
      <NavigationLink
        isSelected
        renderLink={(className, ariaCurrent) => (
          <a href="#custom-selected" className={className} aria-current={ariaCurrent}>
            Selected Custom Link
          </a>
        )}
      />
      <div style={{ background: '#0056A6', padding: '20px' }}>
        <NavigationLink
          variant="inverted"
          renderLink={(className) => {
            return (
              <a href="#custom-selected" className={className}>
                Inverted custom children
              </a>
            );
          }}
        ></NavigationLink>
      </div>
    </Stack>
  ),
};

export const SelectedSetsAriaCurrentPage: Story = {
  args: { isSelected: true, href: '#', children: 'Navigointilinkki' },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Navigointilinkki' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};

export const UnselectedHasNoAriaCurrent: Story = {
  args: { isSelected: false, href: '#', children: 'Navigointilinkki' },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Absent entirely, not `aria-current="false"` — the false string is
    // exposed to AT as a real value and would announce every link as current.
    await expect(canvas.getByRole('link', { name: 'Navigointilinkki' })).not.toHaveAttribute(
      'aria-current'
    );
  },
};

export const ExplicitAriaCurrentWins: Story = {
  args: { isSelected: true, href: '#', children: 'Navigointilinkki', 'aria-current': 'step' },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Navigointilinkki' })).toHaveAttribute(
      'aria-current',
      'step'
    );
  },
};

export const StartIconRendersBeforeLabel: Story = {
  // Figma node 3992:2329's showStartIcon/showEndIcon variants — a fixed 18px
  // icon, spaced 8px from the text on whichever side it's on.
  args: {
    href: '#',
    children: 'Navigointilinkki',
    startIcon: <svg data-testid="start-icon" />,
  },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Navigointilinkki' });
    const icon = canvas.getByTestId('start-icon');

    const iconIndex = childNodeIndex(link, icon.parentElement);
    const labelIndex = labelTextNodeIndex(link, 'Navigointilinkki');
    await expect(iconIndex).toBeGreaterThanOrEqual(0);
    await expect(labelIndex).toBeGreaterThanOrEqual(0);
    await expect(iconIndex).toBeLessThan(labelIndex);
    await expect(icon.parentElement?.getBoundingClientRect().width).toBeCloseTo(18, 0);
  },
};

export const EndIconRendersAfterLabel: Story = {
  args: {
    href: '#',
    children: 'Navigointilinkki',
    endIcon: <svg data-testid="end-icon" />,
  },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Navigointilinkki' });
    const icon = canvas.getByTestId('end-icon');

    const iconIndex = childNodeIndex(link, icon.parentElement);
    const labelIndex = labelTextNodeIndex(link, 'Navigointilinkki');
    await expect(iconIndex).toBeGreaterThanOrEqual(0);
    await expect(labelIndex).toBeGreaterThanOrEqual(0);
    await expect(labelIndex).toBeLessThan(iconIndex);
    await expect(icon.parentElement?.getBoundingClientRect().width).toBeCloseTo(18, 0);
  },
};

export const BothIconsRenderOnBothSides: Story = {
  args: {
    href: '#',
    children: 'Navigointilinkki',
    startIcon: <svg data-testid="start-icon" />,
    endIcon: <svg data-testid="end-icon" />,
  },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Navigointilinkki' });
    const start = canvas.getByTestId('start-icon');
    const end = canvas.getByTestId('end-icon');

    const startIndex = childNodeIndex(link, start.parentElement);
    const endIndex = childNodeIndex(link, end.parentElement);
    const labelIndex = labelTextNodeIndex(link, 'Navigointilinkki');
    await expect(startIndex).toBeLessThan(labelIndex);
    await expect(labelIndex).toBeLessThan(endIndex);
  },
};

export const IconVerticalOffsetIsHalfOfTextLinks: Story = {
  // TextLink's trailing external-link icon (TextLink.css.ts's `externalIcon`)
  // nudges up with `top: components.link.iconVerticalOffset` (-0.2em) to
  // visually balance against the underline — NavigationLink's start/end
  // icons use the same technique, tuned to half that nudge (-0.1em) for its
  // fixed 18px icon.
  render: () => (
    <Stack gap="md">
      <NavigationLink href="#" startIcon={<svg data-testid="start-icon" />}>
        Navigointilinkki
      </NavigationLink>
      <NavigationLink href="#" endIcon={<svg data-testid="end-icon" />}>
        Navigointilinkki
      </NavigationLink>
      <TextLink href="#" openExternal>
        Navigointilinkki
      </TextLink>
    </Stack>
  ),
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const start = canvasElement.querySelector('[data-testid="start-icon"]')
      ?.parentElement as HTMLElement;
    const end = canvasElement.querySelector('[data-testid="end-icon"]')
      ?.parentElement as HTMLElement;
    const textLinkIcon = canvasElement.querySelector('svg[class*="externalIcon"]') as HTMLElement;

    // Both default to p1 (20px), so comparing resolved em→px values directly
    // is meaningful rather than comparing raw em strings.
    const textLinkOffset = parseFloat(getComputedStyle(textLinkIcon).top);
    await expect(textLinkOffset).toBeLessThan(0);
    await expect(parseFloat(getComputedStyle(start).top)).toBeCloseTo(textLinkOffset / 2, 5);
    await expect(parseFloat(getComputedStyle(end).top)).toBeCloseTo(textLinkOffset / 2, 5);
  },
};

export const RenderLinkReceivesDerivedAriaCurrent: Story = {
  args: {
    isSelected: true,
    children: 'Navigointilinkki',
    renderLink: (className: string, ariaCurrent) => (
      <a className={className} href="#" aria-current={ariaCurrent}>
        Navigointilinkki
      </a>
    ),
  },
  tags: ['!dev', '!autodocs'],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Navigointilinkki' })).toHaveAttribute(
      'aria-current',
      'page'
    );
  },
};

// Captures console.error calls for the dev-warning test below.
let capturedConsoleErrors: string[] = [];

export const WarnsWhenRenderLinkIsGivenWithAnIcon: StoryObj<typeof NavigationLink> = {
  // `startIcon`/`endIcon` only render in the default <a> branch — passing
  // either alongside `renderLink` type-checks but silently drops the icon,
  // since renderLink returns its own element instead.
  tags: ['!dev', '!autodocs'],
  render: () => (
    <NavigationLink
      startIcon={<SearchIcon />}
      renderLink={(className) => <UnstyledButton className={className}>Palvelut</UnstyledButton>}
    >
      Palvelut
    </NavigationLink>
  ),
  beforeEach: () => {
    capturedConsoleErrors = [];
    const original = console.error;
    console.error = (...messageArgs: unknown[]) => {
      capturedConsoleErrors.push(String(messageArgs[0]));
    };
    return () => {
      console.error = original;
    };
  },
  play: async () => {
    await waitFor(() =>
      expect(
        capturedConsoleErrors.some((m) => /startIcon.*renderLink|renderLink.*startIcon/i.test(m))
      ).toBe(true)
    );
  },
};
