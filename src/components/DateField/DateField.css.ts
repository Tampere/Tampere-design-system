import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  core,
  font,
  spacing,
  components: { input: inputVars, typography, datePicker, controlHeight, button: buttonVars, icon },
  text,
  focusRing,
} = vars;

// The calendar trigger icon scales with the responsive control size: its width
// tracks the button line-height token (Figma Components/Button/Icon/Size =
// 20/18/16 across breakpoints), so it shrinks with the field instead of staying
// a fixed 24px. Height auto keeps the icon's aspect ratio.
export const triggerIcon = style({
  width: buttonVars.lineHeight,
  height: 'auto',
});

// When the clear (✕) button is shown it sits in the input's right section,
// absolutely positioned at `right: Input/padding.horizontal`. Reserve matching
// right padding on the input so the typed date never runs under the icon. The
// `* 3` factor mirrors TextField's own section padding variant (padding + icon
// + gap). `!important` outranks TextField's base `input` class regardless of
// stylesheet insertion order (same single-class specificity otherwise).
export const inputWithClear = style({
  paddingRight: `calc(${inputVars.padding.horizontal} * 3) !important`,
});

// Dropdown surface. Outer padding scales with the breakpoint (Figma Spacing/Medium, 24→16).
export const popoverContent = style({
  background: core.background,
  border: `${core.strokeWeight} solid ${core.divider}`,
  boxShadow: `0 4px 12px ${core.dropshadow}`,
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
  // Design: select border uses the neutral secondary-text color, not the interactive
  // blue used by text inputs.
  border: `${core.strokeWeight} solid ${text.secondary}`,
  background: core.background,
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
    '&:hover': { border: `${core.strokeWeight} solid ${text.primary}` },
    '&:focus-visible': { ...focusRing },
    '&:disabled': {
      border: `${core.strokeWeight} solid ${core.states.disabled}`,
      color: text.disabled,
      background: core.backgroundDisabled,
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

// Day cells follow Figma Calendar-item/Size: 50px from md up, 36px on sm/xs (see themeVariables.datePicker.cellSize).
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
  ...focusRing,
});

globalStyle(`${calendarGrid} table button:hover:not([data-disabled]):not([data-selected])`, {
  background: core.hover.overlay,
});

// Weekday header (Ma, Ti, …): P2 size, Subheader (Semi-Bold) weight, secondary colour.
globalStyle(`${calendarGrid} thead th`, {
  fontFamily: typography.p2.fontFamily,
  fontSize: typography.p2.fontSize,
  fontWeight: typography.subheader.fontWeight,
  color: text.secondary,
});

export const dayCellStaged = style({
  background: `${core.states.default} !important`,
  color: `${core.contrast} !important`,
  // Selected day number is Semi-Bold per design.
  fontWeight: `${typography.subheader.fontWeight} !important`,
});

export const dayCellToday = style({
  // Today marker: dashed outline in the Date-picker today-marker colour, inset from each edge;
  // the inset is fixed but the resulting cell size varies by breakpoint (Figma today marker).
  outline: `${core.strokeWeight} dashed ${datePicker.todayMarker}`,
  outlineOffset: `calc(${datePicker.todayMarkerInset} * -1)`,
});

export const dayCellOutsideMonth = style({
  // Outside-month days read as disabled in the design: muted bg + disabled text.
  background: `${core.backgroundDisabled} !important`,
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
  background: `${core.backgroundDisabled} !important`,
  color: `${text.disabled} !important`,
  cursor: 'default !important',
  pointerEvents: 'none',
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
