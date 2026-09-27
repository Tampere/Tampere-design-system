import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import cx from 'clsx';
import { Tabs as MantineTabs } from '@mantine/core';
import { useElementSize } from '@mantine/hooks';
import { ChevronLeftIcon } from '../../icons/ChevronLeftIcon';
import { ChevronRightIcon } from '../../icons/ChevronRightIcon';
import { IconButton } from '../IconButton/IconButton';
import { mergeClassNames } from '../../utils';
import {
  alignVariants,
  group,
  list,
  scrollButton,
  tab,
  tabLabel,
  tabLabelReserve,
  tabLabelStack,
  track,
  viewport,
} from './Tabs.css.ts';

export type TabsAlign = 'left' | 'center' | 'right';

const mutationOptions: MutationObserverInit = {
  attributes: true,
  attributeFilter: ['data-active'],
  subtree: true,
};

const SCROLL_STEP_RATIO = 0.8;

interface TabsListConfig {
  align: TabsAlign;
  scrollable: boolean;
  scrollLeftLabel?: string;
  scrollRightLabel?: string;
}

const TabsListContext = createContext<TabsListConfig>({ align: 'left', scrollable: false });

interface TabsBaseProps extends PropsWithChildren {
  /** Controlled value. */
  value?: string | null;
  /** Uncontrolled default value. */
  defaultValue?: string | null;
  onChange?: (value: string | null) => void;
  /** Position of the tab group within the full-width track. @default 'left' */
  align?: TabsAlign;
  /** If set, `arrow key` presses loop through items (first to last and last to first). @default true */
  loop?: boolean;
  /** If set, a tab is activated with arrow-key focus. @default true */
  activateTabWithKeyboard?: boolean;
  /** If set to false, `TabsPanel` content unmounts when its tab isn't active. @default true */
  keepMounted?: boolean;
  id?: string;
  classNames?: { root?: string };
}

// Required only when scrollable — no English fallback, consumer apps are Finnish
export type TabsProps = TabsBaseProps &
  (
    | { scrollable: true; scrollLeftLabel: string; scrollRightLabel: string }
    | { scrollable?: false; scrollLeftLabel?: never; scrollRightLabel?: never }
  );

export const Tabs = ({
  value,
  defaultValue,
  onChange,
  align = 'left',
  scrollable = false,
  scrollLeftLabel,
  scrollRightLabel,
  loop = true,
  activateTabWithKeyboard = true,
  keepMounted = true,
  id,
  classNames,
  children,
}: TabsProps) => {
  // Memoized so a controlled Tabs (new value/onChange each render) doesn't force
  // TabsList to re-run its scroll-state effects/observers on every tab switch.
  const contextValue = useMemo(
    () => ({ align, scrollable, scrollLeftLabel, scrollRightLabel }),
    [align, scrollable, scrollLeftLabel, scrollRightLabel]
  );

  return (
    <MantineTabs
      unstyled
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      loop={loop}
      activateTabWithKeyboard={activateTabWithKeyboard}
      keepMounted={keepMounted}
      id={id}
      classNames={mergeClassNames({}, classNames)}
    >
      <TabsListContext value={contextValue}>{children}</TabsListContext>
    </MantineTabs>
  );
};

export interface TabsListProps {
  children: ReactNode;
  classNames?: { list?: string };
}

export const TabsList = ({ children, classNames }: TabsListProps) => {
  const { align, scrollable, scrollLeftLabel, scrollRightLabel } = use(TabsListContext);

  const { ref: viewportRef, width: viewportWidth } = useElementSize<HTMLDivElement>();
  const { ref: contentRef, width: contentWidth } = useElementSize<HTMLDivElement>();
  const [scrollState, setScrollState] = useState({ canScrollLeft: false, canScrollRight: false });

  // Checks whether the left/right chevrons should be enabled, from how
  // far the viewport is currently scrolled vs. how much there is to scroll.
  const updateScrollState = useCallback(() => {
    const node = viewportRef.current;
    if (!node) {
      setScrollState({ canScrollLeft: false, canScrollRight: false });
      return;
    }
    const maxScrollLeft = node.scrollWidth - node.clientWidth;
    const canScrollLeft = node.scrollLeft > 0;
    const canScrollRight = node.scrollLeft < maxScrollLeft - 1;
    setScrollState((prev) =>
      prev.canScrollLeft === canScrollLeft && prev.canScrollRight === canScrollRight
        ? prev
        : { canScrollLeft, canScrollRight }
    );
  }, [viewportRef]);

  useEffect(() => {
    updateScrollState();
  }, [updateScrollState, viewportWidth, contentWidth]);

  const scrollActiveIntoView = useCallback(() => {
    const activeTab = viewportRef.current?.querySelector<HTMLElement>('[data-active]');
    activeTab?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [viewportRef]);

  // Covers the initial tab (defaultValue) — the observer below only fires on later changes
  useEffect(() => {
    scrollActiveIntoView();
  }, [scrollActiveIntoView]);

  // Managed directly (not via mantine's useMutationObserver) so the effect
  // genuinely depends on `scrollable` and re-attaches once the viewport div
  // exists
  useEffect(() => {
    if (!scrollable) return;
    const node = viewportRef.current;
    if (!node) return;
    const observer = new MutationObserver(scrollActiveIntoView);
    observer.observe(node, mutationOptions);
    return () => observer.disconnect();
  }, [scrollable, scrollActiveIntoView, viewportRef]);

  const scrollByViewport = (direction: 1 | -1) => {
    const node = viewportRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * SCROLL_STEP_RATIO });
  };

  const tabsList = (
    <MantineTabs.List
      ref={contentRef}
      classNames={{ ...mergeClassNames({ list }, classNames) }} // Spread to tell typescript an object is always returned
    >
      {children}
    </MantineTabs.List>
  );

  if (!scrollable) {
    return (
      <div className={track}>
        <div className={cx(group, alignVariants[align])}>{tabsList}</div>
      </div>
    );
  }

  return (
    <div className={track}>
      <div className={cx(group, alignVariants[align])}>
        <IconButton
          size="xl"
          onClick={() => scrollByViewport(-1)}
          disabled={!scrollState.canScrollLeft}
          aria-label={scrollLeftLabel}
          classNames={{ root: scrollButton }}
        >
          <ChevronLeftIcon />
        </IconButton>
        <div ref={viewportRef} className={viewport} onScroll={updateScrollState}>
          {tabsList}
        </div>
        <IconButton
          size="xl"
          onClick={() => scrollByViewport(1)}
          disabled={!scrollState.canScrollRight}
          aria-label={scrollRightLabel}
          classNames={{ root: scrollButton }}
        >
          <ChevronRightIcon />
        </IconButton>
      </div>
    </div>
  );
};

export interface TabsTabProps {
  value: string;
  children: ReactNode;
  classNames?: { tab?: string; tabLabel?: string };
}

export const TabsTab = ({ value, children, classNames }: TabsTabProps) => {
  return (
    <MantineTabs.Tab
      value={value}
      classNames={{ ...mergeClassNames({ tab, tabLabel: tabLabelStack }, classNames) }} // Spread to tell typescript an object is always returned
    >
      <span className={tabLabel}>{children}</span>
      {/* Hidden twin reserving width for the bold selected state; aria-hidden as a backup to visibility:hidden */}
      <span className={tabLabelReserve} aria-hidden="true">
        {children}
      </span>
    </MantineTabs.Tab>
  );
};

export interface TabsPanelProps {
  value: string;
  children: ReactNode;
  classNames?: { panel?: string };
}

export const TabsPanel = ({ value, children, classNames }: TabsPanelProps) => {
  return (
    <MantineTabs.Panel
      value={value}
      classNames={{ ...mergeClassNames({}, classNames) }} // Spread to tell typescript an object is always returned
    >
      {children}
    </MantineTabs.Panel>
  );
};
