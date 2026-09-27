import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import { Tabs, TabsList, TabsTab, TabsPanel } from './Tabs';

// Hardcoded <Tabs> trees, not `args` — TabsProps' discriminated union on
// `scrollable` doesn't play well with Storybook's args typing.
const meta = {
  component: Tabs,
  tags: ['!dev', '!autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

// Re-adds the tags `meta` strips, marking a story as a doc example.
const docExample = ['dev', 'autodocs'];

// ── Documentation examples (visible in sidebar + autodocs) ───────────────────

export const Default: Story = {
  tags: docExample,
  render: () => (
    <Tabs defaultValue="first">
      <TabsList>
        <TabsTab value="first">Välilehti</TabsTab>
        <TabsTab value="second">Välilehti</TabsTab>
        <TabsTab value="third">Välilehti</TabsTab>
      </TabsList>
      <TabsPanel value="first">Ensimmäisen välilehden sisältö</TabsPanel>
      <TabsPanel value="second">Toisen välilehden sisältö</TabsPanel>
      <TabsPanel value="third">Kolmannen välilehden sisältö</TabsPanel>
    </Tabs>
  ),
};

export const AlignCenter: Story = {
  tags: docExample,
  render: () => (
    <Tabs defaultValue="first" align="center">
      <TabsList>
        <TabsTab value="first">Välilehti</TabsTab>
        <TabsTab value="second">Välilehti</TabsTab>
        <TabsTab value="third">Välilehti</TabsTab>
      </TabsList>
      <TabsPanel value="first">Ensimmäisen välilehden sisältö</TabsPanel>
      <TabsPanel value="second">Toisen välilehden sisältö</TabsPanel>
      <TabsPanel value="third">Kolmannen välilehden sisältö</TabsPanel>
    </Tabs>
  ),
};

export const AlignRight: Story = {
  tags: docExample,
  render: () => (
    <Tabs defaultValue="first" align="right">
      <TabsList>
        <TabsTab value="first">Välilehti</TabsTab>
        <TabsTab value="second">Välilehti</TabsTab>
        <TabsTab value="third">Välilehti</TabsTab>
      </TabsList>
      <TabsPanel value="first">Ensimmäisen välilehden sisältö</TabsPanel>
      <TabsPanel value="second">Toisen välilehden sisältö</TabsPanel>
      <TabsPanel value="third">Kolmannen välilehden sisältö</TabsPanel>
    </Tabs>
  ),
};

export const Scrollable: Story = {
  tags: docExample,
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Tabs
        defaultValue="tab-1"
        scrollable
        scrollLeftLabel="Vieritä vasemmalle"
        scrollRightLabel="Vieritä oikealle"
      >
        <TabsList>
          {Array.from({ length: 8 }, (_, index) => (
            <TabsTab key={index} value={`tab-${index + 1}`}>
              Välilehti
            </TabsTab>
          ))}
        </TabsList>
        {Array.from({ length: 8 }, (_, index) => (
          <TabsPanel key={index} value={`tab-${index + 1}`}>
            Välilehden {index + 1} sisältö
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  ),
};

export const Controlled: Story = {
  tags: docExample,
  render: () => {
    function Wrapper() {
      const [value, setValue] = useState<string | null>('first');
      return (
        <Tabs value={value} onChange={setValue}>
          <TabsList>
            <TabsTab value="first">Välilehti</TabsTab>
            <TabsTab value="second">Välilehti</TabsTab>
            <TabsTab value="third">Välilehti</TabsTab>
          </TabsList>
          <TabsPanel value="first">Ensimmäisen välilehden sisältö</TabsPanel>
          <TabsPanel value="second">Toisen välilehden sisältö</TabsPanel>
          <TabsPanel value="third">Kolmannen välilehden sisältö</TabsPanel>
        </Tabs>
      );
    }
    return <Wrapper />;
  },
};

// ── Test-only specs (hidden from sidebar/autodocs, still run as browser tests) ─

// ── Panel switching ───────────────────────────────────────────────────────────

export const ClickingATabSwitchesThePanel: Story = {
  render: () => (
    <Tabs defaultValue="bussit">
      <TabsList>
        <TabsTab value="bussit">Bussit</TabsTab>
        <TabsTab value="ratikat">Ratikat</TabsTab>
      </TabsList>
      <TabsPanel value="bussit">Bussiaikataulut</TabsPanel>
      <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bussitTab = canvas.getByRole('tab', { name: 'Bussit' });
    const ratikatTab = canvas.getByRole('tab', { name: 'Ratikat' });

    await expect(canvas.getByText('Bussiaikataulut')).toBeVisible();
    await expect(bussitTab).toHaveAttribute('aria-selected', 'true');
    await expect(ratikatTab).toHaveAttribute('aria-selected', 'false');

    await userEvent.click(ratikatTab);

    await expect(canvas.getByText('Ratikka-aikataulut')).toBeVisible();
    await expect(ratikatTab).toHaveAttribute('aria-selected', 'true');
    await expect(bussitTab).toHaveAttribute('aria-selected', 'false');
    const panelId = ratikatTab.getAttribute('aria-controls');
    await expect(canvas.getByText('Ratikka-aikataulut').closest(`#${panelId}`)).not.toBeNull();
  },
};

// ── Keyboard navigation ───────────────────────────────────────────────────────

export const ArrowKeysMoveSelectionAndWrap: Story = {
  render: () => (
    <Tabs defaultValue="bussit">
      <TabsList>
        <TabsTab value="bussit">Bussit</TabsTab>
        <TabsTab value="ratikat">Ratikat</TabsTab>
        <TabsTab value="kavely">Kävely</TabsTab>
      </TabsList>
      <TabsPanel value="bussit">Bussiaikataulut</TabsPanel>
      <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
      <TabsPanel value="kavely">Kävelyreitit</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bussitTab = canvas.getByRole('tab', { name: 'Bussit' });
    const ratikatTab = canvas.getByRole('tab', { name: 'Ratikat' });
    const kavelyTab = canvas.getByRole('tab', { name: 'Kävely' });

    bussitTab.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect(ratikatTab).toHaveFocus();
    await expect(ratikatTab).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowRight}');
    await expect(kavelyTab).toHaveFocus();

    await userEvent.keyboard('{ArrowRight}');
    await expect(bussitTab).toHaveFocus();
    await expect(bussitTab).toHaveAttribute('aria-selected', 'true');

    await userEvent.keyboard('{ArrowLeft}');
    await expect(kavelyTab).toHaveFocus();
  },
};

export const HomeAndEndJumpToFirstAndLast: Story = {
  render: () => (
    <Tabs defaultValue="bussit">
      <TabsList>
        <TabsTab value="bussit">Bussit</TabsTab>
        <TabsTab value="ratikat">Ratikat</TabsTab>
        <TabsTab value="kavely">Kävely</TabsTab>
      </TabsList>
      <TabsPanel value="bussit">Bussiaikataulut</TabsPanel>
      <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
      <TabsPanel value="kavely">Kävelyreitit</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bussitTab = canvas.getByRole('tab', { name: 'Bussit' });
    const kavelyTab = canvas.getByRole('tab', { name: 'Kävely' });

    bussitTab.focus();
    await userEvent.keyboard('{End}');
    await expect(kavelyTab).toHaveFocus();

    await userEvent.keyboard('{Home}');
    await expect(bussitTab).toHaveFocus();
  },
};

export const TabKeyExitsTheTablist: Story = {
  render: () => (
    <Tabs defaultValue="bussit">
      <TabsList>
        <TabsTab value="bussit">Bussit</TabsTab>
        <TabsTab value="ratikat">Ratikat</TabsTab>
      </TabsList>
      <TabsPanel value="bussit">
        <a href="#panel-link">Bussiaikataulut, linkki</a>
      </TabsPanel>
      <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const bussitTab = canvas.getByRole('tab', { name: 'Bussit' });
    const panelLink = canvas.getByRole('link', { name: 'Bussiaikataulut, linkki' });

    bussitTab.focus();
    await userEvent.tab();
    // Roving tabindex — only the active tab is tabbable, so Tab skips to the panel.
    await expect(panelLink).toHaveFocus();
  },
};

// ── Controlled / uncontrolled ─────────────────────────────────────────────────

export const UncontrolledSelectsDefaultValueOnMount: Story = {
  render: () => (
    <Tabs defaultValue="ratikat">
      <TabsList>
        <TabsTab value="bussit">Bussit</TabsTab>
        <TabsTab value="ratikat">Ratikat</TabsTab>
      </TabsList>
      <TabsPanel value="bussit">Bussiaikataulut</TabsPanel>
      <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('tab', { name: 'Ratikat' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(canvas.getByText('Ratikka-aikataulut')).toBeVisible();

    await userEvent.click(canvas.getByRole('tab', { name: 'Bussit' }));
    await expect(canvas.getByText('Bussiaikataulut')).toBeVisible();
  },
};

const controlledChangeSpy = fn();
export const ControlledOnlySwitchesWhenValuePropChanges: Story = {
  render: () => (
    <Tabs value="bussit" onChange={controlledChangeSpy}>
      <TabsList>
        <TabsTab value="bussit">Bussit</TabsTab>
        <TabsTab value="ratikat">Ratikat</TabsTab>
      </TabsList>
      <TabsPanel value="bussit">Bussiaikataulut</TabsPanel>
      <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('tab', { name: 'Ratikat' }));

    // onChange fires, but the panel doesn't switch since `value` stays pinned —
    // proves we don't mirror Mantine's state internally.
    await expect(controlledChangeSpy).toHaveBeenCalledWith('ratikat');
    await expect(canvas.getByText('Bussiaikataulut')).toBeVisible();
    await expect(canvas.getByRole('tab', { name: 'Bussit' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  },
};

export const ControlledValueUpdateFromOutsideSwitchesPanel: Story = {
  render: () => {
    function Wrapper() {
      const [value, setValue] = useState<string | null>('bussit');
      return (
        <>
          <button type="button" onClick={() => setValue('ratikat')}>
            Vaihda ratikoihin
          </button>
          <Tabs value={value} onChange={setValue}>
            <TabsList>
              <TabsTab value="bussit">Bussit</TabsTab>
              <TabsTab value="ratikat">Ratikat</TabsTab>
            </TabsList>
            <TabsPanel value="bussit">Bussiaikataulut</TabsPanel>
            <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
          </Tabs>
        </>
      );
    }
    return <Wrapper />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Vaihda ratikoihin' }));
    await expect(canvas.getByText('Ratikka-aikataulut')).toBeVisible();
    await expect(canvas.getByRole('tab', { name: 'Ratikat' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  },
};

// ── Layout stability under the 400/600 weight change ──────────────────────────

export const TabWidthIsStableAcrossSelection: Story = {
  render: () => (
    <Tabs defaultValue="bussit">
      <TabsList>
        <TabsTab value="bussit">Bussit</TabsTab>
        <TabsTab value="ratikat">Ratikat</TabsTab>
      </TabsList>
      <TabsPanel value="bussit">Bussiaikataulut</TabsPanel>
      <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const ratikatTab = canvas.getByRole('tab', { name: 'Ratikat' });
    const widthBeforeSelection = ratikatTab.getBoundingClientRect().width;

    await userEvent.click(ratikatTab);

    const widthAfterSelection = ratikatTab.getBoundingClientRect().width;
    await expect(widthAfterSelection).toBeCloseTo(widthBeforeSelection, 0);

    // Reserved-width twin must not leak into the accessible name.
    await expect(ratikatTab).toHaveAccessibleName('Ratikat');
  },
};

export const CenteredGroupDoesNotDriftOnSelection: Story = {
  render: () => (
    <Tabs defaultValue="bussit" align="center">
      <TabsList>
        <TabsTab value="bussit">Bussit</TabsTab>
        <TabsTab value="ratikat">Ratikat</TabsTab>
        <TabsTab value="kavely">Kävely</TabsTab>
      </TabsList>
      <TabsPanel value="bussit">Bussiaikataulut</TabsPanel>
      <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
      <TabsPanel value="kavely">Kävelyreitit</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const list = canvas.getByRole('tablist');
    const rectBefore = list.getBoundingClientRect();

    await userEvent.click(canvas.getByRole('tab', { name: 'Kävely' }));

    const rectAfter = list.getBoundingClientRect();
    await expect(rectAfter.left).toBeCloseTo(rectBefore.left, 0);
    await expect(rectAfter.width).toBeCloseTo(rectBefore.width, 0);
  },
};

// ── Scroll behaviour ──────────────────────────────────────────────────────────

function ScrollableTabs({ align }: { align?: 'left' | 'center' | 'right' }) {
  return (
    <div style={{ maxWidth: 280 }}>
      <Tabs
        defaultValue="tab-1"
        align={align}
        scrollable
        scrollLeftLabel="Vieritä vasemmalle"
        scrollRightLabel="Vieritä oikealle"
      >
        <TabsList>
          {Array.from({ length: 8 }, (_, index) => (
            <TabsTab key={index} value={`tab-${index + 1}`}>
              {`Välilehti ${index + 1}`}
            </TabsTab>
          ))}
        </TabsList>
        {Array.from({ length: 8 }, (_, index) => (
          <TabsPanel key={index} value={`tab-${index + 1}`}>
            Sisältö {index + 1}
          </TabsPanel>
        ))}
      </Tabs>
    </div>
  );
}

export const ScrollButtonsAppearAndDisableAtEnds: Story = {
  render: () => <ScrollableTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scrollLeft = canvas.getByRole('button', { name: 'Vieritä vasemmalle' });
    const scrollRight = canvas.getByRole('button', { name: 'Vieritä oikealle' });

    await expect(scrollLeft).toBeDisabled();
    await expect(scrollRight).not.toBeDisabled();

    await userEvent.click(scrollRight);
    await waitFor(async () => {
      await expect(scrollLeft).not.toBeDisabled();
    });
  },
};

export const NonOverflowingScrollableRendersBothChevronsDisabled: Story = {
  render: () => (
    <Tabs
      defaultValue="bussit"
      scrollable
      scrollLeftLabel="Vieritä vasemmalle"
      scrollRightLabel="Vieritä oikealle"
    >
      <TabsList>
        <TabsTab value="bussit">Bussit</TabsTab>
        <TabsTab value="ratikat">Ratikat</TabsTab>
      </TabsList>
      <TabsPanel value="bussit">Bussiaikataulut</TabsPanel>
      <TabsPanel value="ratikat">Ratikka-aikataulut</TabsPanel>
    </Tabs>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Fits fully, but both chevrons still render disabled — deliberate, not a bug:
    // keeps the strip's width stable rather than popping the chevrons in and out
    // the moment content grows enough to overflow.
    await expect(canvas.getByRole('button', { name: 'Vieritä vasemmalle' })).toBeDisabled();
    await expect(canvas.getByRole('button', { name: 'Vieritä oikealle' })).toBeDisabled();
  },
};

export const CenteredOverflowingStripStillReachesTheFirstTab: Story = {
  render: () => <ScrollableTabs align="center" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const scrollLeft = canvas.getByRole('button', { name: 'Vieritä vasemmalle' });
    const firstTab = canvas.getByRole('tab', { name: 'Välilehti 1' });

    // Regression test for `safe center` — plain `center` would strand the first tab.
    await expect(scrollLeft).toBeDisabled();
    await userEvent.click(canvas.getByRole('button', { name: 'Vieritä oikealle' }));
    await waitFor(async () => {
      await expect(scrollLeft).not.toBeDisabled();
    });

    await userEvent.click(scrollLeft);
    await waitFor(async () => {
      await expect(firstTab.getBoundingClientRect().left).toBeGreaterThanOrEqual(0);
    });
  },
};

export const KeyboardNavigationScrollsTheActiveTabIntoView: Story = {
  render: () => <ScrollableTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstTab = canvas.getByRole('tab', { name: 'Välilehti 1' });
    const lastTab = canvas.getByRole('tab', { name: 'Välilehti 8' });

    firstTab.focus();
    await userEvent.keyboard('{End}');
    await expect(lastTab).toHaveFocus();

    await waitFor(async () => {
      const viewport = lastTab.closest('[role="tablist"]')?.parentElement as HTMLElement;
      const viewportRect = viewport.getBoundingClientRect();
      const tabRect = lastTab.getBoundingClientRect();
      await expect(tabRect.right).toBeLessThanOrEqual(viewportRect.right + 1);
      await expect(tabRect.left).toBeGreaterThanOrEqual(viewportRect.left - 1);
    });
  },
};

export const ScrollButtonsExposeAccessibleNames: Story = {
  render: () => <ScrollableTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('button', { name: 'Vieritä vasemmalle' })).toHaveAccessibleName(
      'Vieritä vasemmalle'
    );
    await expect(canvas.getByRole('button', { name: 'Vieritä oikealle' })).toHaveAccessibleName(
      'Vieritä oikealle'
    );
  },
};

export const TablistContainsOnlyTabChildren: Story = {
  render: () => <ScrollableTabs />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tablist = canvas.getByRole('tablist');
    // Chevrons must stay siblings of the tablist — nesting them inside breaks
    // the ARIA tabs pattern.
    const nonTabChildren = Array.from(tablist.children).filter(
      (child) => child.getAttribute('role') !== 'tab'
    );
    await expect(nonTabChildren).toHaveLength(0);
  },
};
