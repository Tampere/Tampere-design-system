import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    states,
    font,
    components: {
      input: inputVars,
      typography,
      datePicker,
      controlHeight,
      button: buttonVars,
      icon,
    },
    text,
    focusRing,
    background,
    strokeWeight,
    divider,
    dropShadow,
    inputStates,
    hover,
    contrast,
  },
  primitives: { spacing },
} = vars;

// The calendar trigger icon scales with the responsive control size: its width
// tracks the button line-height token (Figma Components/Button/Icon/Size =
// 20/18/16 across breakpoints), so it shrinks with the field instead of staying
// a fixed 24px. Height auto keeps the icon's aspect ratio.
export const triggerIcon = style({
  width: buttonVars.lineHeight,
  height: 'auto',
});

// Dropdown surface. Outer padding scales with the breakpoint (Figma Spacing/Medium, 24→16).
export const popoverContent = style({
  background: background.default,
  border: `${strokeWeight} solid ${divider}`,
  boxShadow: `0 4px 12px ${dropShadow}`,
  padding: datePicker.padding,
});

// Header, grid and footer stack vertically with a Spacing/Medium gap (responsive 24→16).
export const calendar = style({
  display: 'flex',
  flexDirection: 'column',
  gap: datePicker.padding,
});

export const calendarHeader = style({
  display: 'flex',
  alignItems: 'center',
  // Figma Header gap = Spacing/1,5 (12px, fixed across breakpoints).
  gap: datePicker.headerGap,
});

export const calendarHeaderSelects = style({
  display: 'flex',
  // Gap between the year and month selects = Figma Input/Input-spacing (8→4, responsive).
  gap: inputVars.spacing.horizontalSpacing,
  flex: '1',
});

// Wraps a native <select> so the design's chevron-down icon can be overlaid on
// the right; the wrapper hugs the select so each dropdown keeps its natural
// width (the full month name must stay visible, never truncated).
export const nativeSelectWrapper = style({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
});

export const nativeSelect = style({
  // Strip the browser's default dropdown arrow so the TREDS chevron can show.
  appearance: 'none',
  // Match the shared control height so the header selects align with the field's
  // inputs and buttons; border sits inside the box.
  height: controlHeight,
  boxSizing: 'border-box',
  // Same neutral resting border as TextField/TextArea (inputStates.default,
  // Figma's "Input-states/Default") — form-control borders only borrow the brand
  // blue (theme.states) on hover/focus.
  border: `${strokeWeight} solid ${inputStates.default}`,
  background: background.default,
  color: text.primary,
  fontSize: inputVars.font.text.fontSize,
  lineHeight: inputVars.font.text.lineHeight,
  letterSpacing: font.letterSpacing,
  // Horizontal padding tracks the input's responsive Spacing/Small (16→12).
  padding: `0 ${inputVars.padding.horizontal}`,
  // Reserve room on the right for the overlaid chevron (padding + icon width + gap).
  paddingRight: `calc(${inputVars.padding.horizontal} + ${icon.size.medium} + ${spacing['1']})`,
  cursor: 'pointer',
  selectors: {
    '&:hover': { border: `${strokeWeight} solid ${states.hover}` },
    '&:focus-visible': { ...focusRing },
    '&:disabled': {
      border: `${strokeWeight} solid ${states.disabled}`,
      color: text.disabled,
      background: background.disabled,
      cursor: 'default',
    },
  },
});

export const nativeSelectIcon = style({
  position: 'absolute',
  right: inputVars.padding.horizontal,
  top: '50%',
  transform: 'translateY(-50%)',
  // Single source for the chevron width, matched by the select's reserved
  // paddingRight above (Components/Icon/Size medium = 20px).
  width: icon.size.medium,
  height: 'auto',
  // Let clicks fall through to the <select> beneath.
  pointerEvents: 'none',
  color: text.secondary,
});

// Wrapper around Mantine Calendar — used to scope globalStyles below
export const calendarGrid = style({});

// Day cells follow Figma Calendar-item/Size: 50px from md up, 36px on sm/xs (see datePicker.cellSize above, sourced from themeVariables.theme.components.datePicker.cellSize).
globalStyle(`${calendarGrid} table button`, {
  borderRadius: 0,
  width: datePicker.cellSize,
  height: datePicker.cellSize,
  // Day numbers: P2 body type, regular weight, primary text colour (design tokens).
  fontFamily: typography.p2.fontFamily,
  fontSize: typography.p2.fontSize,
  fontWeight: typography.p2.fontWeight,
  color: text.primary,
});

// 4px (Spacing/0,5) gap between day/weekday cells: half the gap as padding on each
// side of every table cell. `:where()` in Mantine's reset has zero specificity, so
// this class-scoped rule wins without `!important`.
globalStyle(`${calendarGrid} td, ${calendarGrid} th`, {
  padding: `calc(${datePicker.cellGap} / 2)`,
});

globalStyle(`${calendarGrid} table button:focus-visible`, {
  // Figma's plain Focus state also fills with the hover tint (Background/Focus,
  // same value as Background/Hover) — reuse the same overlay technique as the
  // hover rule below rather than a flat color, so the two stay visually
  // consistent. A selected cell's `!important` blue background still wins.
  background: hover.overlay,
  ...focusRing,
});

globalStyle(`${calendarGrid} table button:hover:not([data-disabled]):not([data-selected])`, {
  background: hover.overlay,
});

// Weekday header (Ma, Ti, …): P2 size, Subheader (Semi-Bold) weight, secondary colour.
globalStyle(`${calendarGrid} thead th`, {
  fontFamily: typography.p2.fontFamily,
  fontSize: typography.p2.fontSize,
  fontWeight: typography.subheader.fontWeight,
  color: text.secondary,
});

export const dayCellStaged = style({
  background: `${states.default} !important`,
  color: `${contrast} !important`,
  // Selected day number is Semi-Bold per design.
  fontWeight: `${typography.subheader.fontWeight} !important`,
  selectors: {
    // A selected cell never got hover feedback: the generic hover rule above
    // explicitly excludes [data-selected]. `&:hover` here has higher
    // specificity than the plain class rule above, so it wins without needing
    // its own !important on top of the one above (still needed to beat that
    // base rule's !important background at equal-or-lower specificity).
    '&:hover': {
      background: `${states.hover} !important`,
    },
  },
});

// Shared geometry for the today-marker pseudo-element — a dashed border inset
// from each edge, sized the same regardless of color. Implemented as ::after
// (not `outline`) so it can coexist with the focus ring below, which uses
// `outline` on the button itself: two elements, two properties, no clobbering.
const todayMarkerAfter = {
  content: '""',
  position: 'absolute',
  inset: datePicker.todayMarkerInset,
  pointerEvents: 'none',
} as const;

export const dayCellToday = style({
  position: 'relative',
  selectors: {
    '&::after': {
      ...todayMarkerAfter,
      border: `${strokeWeight} dashed ${datePicker.todayMarker}`,
    },
  },
});

// Today AND selected: the marker must stay visible over the blue selected
// background, so it switches to the contrast (white) color — Figma's
// "Today & Selected" cell. Applied alongside dayCellStaged, not instead of it.
export const dayCellTodaySelected = style({
  position: 'relative',
  selectors: {
    '&::after': {
      ...todayMarkerAfter,
      border: `${strokeWeight} dashed ${datePicker.todayMarkerContrast}`,
    },
  },
});

export const dayCellOutsideMonth = style({
  // Outside-month days read as disabled in the design: muted bg + disabled text.
  background: `${background.disabled} !important`,
  color: `${text.disabled} !important`,
  // Mantine's own Day styles apply `opacity: 0.5` to every [data-outside] cell
  // (via a zero-specificity `:where()` rule) regardless of our colors. These
  // cells stay real, non-`disabled` buttons (only genuinely out-of-range days
  // get the `disabled` attribute — see DateFieldCalendar's getDayProps), so
  // that extra dimming isn't exempt from WCAG contrast: it halves our already
  // AA-passing text/background pair (4.93:1) down to ~2:1. Cancel it so the
  // token colors render at their intended, audited contrast.
  opacity: '1 !important',
});

export const dayCellDisabled = style({
  background: `${background.disabled} !important`,
  color: `${text.disabled} !important`,
  cursor: 'default !important',
  pointerEvents: 'none',
  // Same fix as dayCellOutsideMonth above: Mantine's own Day styles apply
  // opacity: 0.5 to every :disabled/[data-disabled] cell too, making these
  // read noticeably more washed-out than outside-month cells despite sharing
  // the same "muted bg + disabled text" design intent. Cancel it.
  opacity: '1 !important',
});

export const calendarFooter = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

// Groups the cancel + confirm buttons together on the right (Figma Primary actions),
// leaving the Today button on the left. Gap = Figma Spacing/2 (16px, fixed).
export const footerActions = style({
  display: 'flex',
  alignItems: 'center',
  gap: spacing['2'],
});

export const hiddenCalendarHeader = style({ display: 'none' });

export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
});
