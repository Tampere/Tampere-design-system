import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  core,
  font,
  components: { input: inputVars, typography, datePicker },
  text,
  focusRing,
} = vars;

export const popoverContent = style({
  background: core.background,
  border: `${core.strokeWeight} solid ${core.divider}`,
  boxShadow: `0 4px 12px ${core.dropshadow}`,
  padding: inputVars.padding.vertical,
  minWidth: '280px',
});

export const calendarHeader = style({
  display: 'flex',
  alignItems: 'center',
  gap: inputVars.spacing.horizontalSpacing,
  marginBottom: inputVars.spacing.verticalSpacing,
});

export const calendarHeaderSelects = style({
  display: 'flex',
  gap: inputVars.spacing.horizontalSpacing,
  flex: '1',
});

export const nativeSelect = style({
  // Design: select border uses Input-states/Default (#52525b = text.secondary),
  // not the blue Primary-states/Default used by text inputs.
  border: `${core.strokeWeight} solid ${text.secondary}`,
  background: core.background,
  color: text.primary,
  fontSize: inputVars.font.text.fontSize,
  lineHeight: inputVars.font.text.lineHeight,
  letterSpacing: font.letterSpacing,
  padding: `${inputVars.padding.vertical} ${inputVars.padding.horizontal}`,
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

// Wrapper around Mantine Calendar — used to scope globalStyles below
export const calendarGrid = style({});

globalStyle(`${calendarGrid} table button`, {
  borderRadius: 0,
  width: '40px',
  height: '40px',
  // Day numbers: P2 body type, regular weight, primary text colour (design tokens).
  fontFamily: typography.p2.fontFamily,
  fontSize: typography.p2.fontSize,
  fontWeight: typography.p2.fontWeight,
  color: text.primary,
});

globalStyle(`${calendarGrid} table button:focus-visible`, {
  ...focusRing,
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
  // Today marker: dashed outline in the Date-picker today-marker colour.
  outline: `${core.strokeWeight} dashed ${datePicker.todayMarker}`,
  outlineOffset: '-2px',
});

export const dayCellOutsideMonth = style({
  // Outside-month days read as disabled in the design: muted bg + disabled text.
  background: `${core.backgroundDisabled} !important`,
  color: `${text.disabled} !important`,
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
  marginTop: inputVars.spacing.verticalSpacing,
  gap: inputVars.spacing.horizontalSpacing,
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
