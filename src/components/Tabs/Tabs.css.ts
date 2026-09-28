import { style, styleVariants, globalStyle } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { button, controlHeight, tabs },
    states,
    font,
    focusRing,
    strokeWeight,
  },
} = vars;

// Reused from Button rather than duplicated onto `tabs` — see theme.ts.
const tabFont = {
  fontSize: button.fontSize,
  lineHeight: button.lineHeight,
  letterSpacing: font.letterSpacing,
};

// How far `focusRing`'s outline extends past a tab's border box (outline width +
// outline-offset). `viewport` below needs matching padding on this side or the
// ring gets clipped by its own scrolling — CSS forces `overflow-y` to also clip
// once `overflow-x` isn't `visible`, so the ring's top is always cut, and its
// left/right are cut whenever the focused tab sits at either scroll extreme.
const focusRingInset = `calc(${strokeWeight} * 1.5)`;

// ::before spans the full track (not `list`, which is only as wide as the
// tabs). `position: absolute` lifts it out of normal flow, so it would
// otherwise paint *above* the tabs' own border-bottom regardless of DOM
// order — `zIndex: 0` on track scopes a local stacking context, and the
// `::before`'s negative z-index below keeps it under the selected tab's
// border instead of covering it.
export const track = style({
  position: 'relative',
  width: '100%',
  boxSizing: 'border-box',
  zIndex: 0,
  selectors: {
    '&::before': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: tabs.rule.thickness,
      backgroundColor: tabs.rule.color,
      zIndex: -1,
    },
  },
});

// minWidth: 0 lets this shrink so `viewport`, not `group`, overflows and scrolls.
export const group = style({
  display: 'flex',
  alignItems: 'center',
  maxWidth: '100%',
  minWidth: 0,
  gap: tabs.scrollButton.spacing,
});

// `safe` keeps the first tab reachable once content overflows — plain
// `center`/`flex-end` would strand it past the unreachable start edge.
export const alignVariants = styleVariants({
  left: { justifyContent: 'flex-start' },
  center: { justifyContent: 'safe center' },
  right: { justifyContent: 'safe flex-end' },
});

// Drives the imperative scrollIntoView/scrollBy calls in Tabs.tsx, including
// the reduced-motion override, so they need no `behavior` option or JS branch.
// Padding on all three sides gives a focused tab's outline room to paint
// instead of being clipped by the scrolling/hidden overflow — real, deliberate
// inset, not cancelled by a margin anywhere. Bottom stays 0: the rule/indicator
// overlap technique (see `track`) needs it untouched.
export const viewport = style({
  display: 'flex',
  minWidth: 0,
  overflowX: 'auto',
  overflowY: 'hidden',
  padding: `${focusRingInset} ${focusRingInset} 0`,
  scrollbarWidth: 'none',
  scrollBehavior: 'smooth',
  selectors: {
    '&::-webkit-scrollbar': { display: 'none' },
  },
  '@media': {
    '(prefers-reduced-motion: reduce)': {
      scrollBehavior: 'auto',
    },
  },
});

export const list = style({
  display: 'flex',
  alignItems: 'center',
});

export const scrollButton = style({
  selectors: {
    '&:disabled': {
      cursor: 'not-allowed !important',
    },
  },
});

// `data-active` comes from Mantine's TabsTab.
export const tab = style({
  ...tabFont,
  height: controlHeight,
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  padding: `0 ${button.padding.horizontal}`,
  // `scrollIntoView({ inline: 'nearest' })` in Tabs.tsx only scrolls far enough
  // to reveal the tab's own box — it doesn't know the focus ring extends past
  // it, so keyboard nav to an edge tab used to stop short of the room
  // `viewport`'s padding reserved for the ring, even though scrolling there
  // manually reached it fine. `scroll-margin-inline` tells that same "nearest"
  // calculation to treat the tab as if it were this much wider, so it scrolls
  // far enough to include the ring's space too.
  scrollMarginInline: focusRingInset,
  color: tabs.text.default,
  background: 'none',
  border: 'none',
  borderBottom: `${tabs.indicator.thickness} solid transparent`,
  cursor: 'pointer',
  selectors: {
    '&[data-active]': {
      color: tabs.text.selected,
      borderBottomColor: tabs.text.selected,
    },
    '&:hover': {
      color: states.hover,
      borderBottomColor: states.hover,
    },
    '&:active': {
      color: states.active,
      borderBottomColor: states.active,
    },
    // Same specificity as `[data-active]` — wins by being declared after it.
    '&:focus-visible': {
      ...focusRing,
      borderBottomColor: states.hover,
    },
  },
});

// Targets Mantine's own tabLabel slot; grid stacks the visible label and the
// hidden reserve span (below) in the same cell instead of side by side.
export const tabLabelStack = style({ display: 'grid' });
globalStyle(`${tabLabelStack} > *`, { gridArea: '1 / 1' });

export const tabLabel = style({ fontWeight: tabs.label.fontWeight.default });
globalStyle(`${tab}[data-active] ${tabLabel}`, {
  fontWeight: tabs.label.fontWeight.selected,
});

// Invisible 600-weight twin reserves the selected width so a tab (and the
// group after it) doesn't resize the moment it's selected.
export const tabLabelReserve = style({
  fontWeight: tabs.label.fontWeight.selected,
  visibility: 'hidden',
  pointerEvents: 'none',
});
