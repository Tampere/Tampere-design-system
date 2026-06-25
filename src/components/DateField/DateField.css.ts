import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  core,
  font,
  components: { input: inputVars },
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
  border: `${core.strokeWeight} solid ${core.states.default}`,
  background: core.background,
  color: text.primary,
  fontSize: inputVars.font.text.fontSize,
  lineHeight: inputVars.font.text.lineHeight,
  letterSpacing: font.letterSpacing,
  padding: `${inputVars.padding.vertical} ${inputVars.padding.horizontal}`,
  cursor: 'pointer',
  selectors: {
    '&:hover': { border: `${core.strokeWeight} solid ${core.states.hover}` },
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
});

globalStyle(`${calendarGrid} table button:focus-visible`, {
  ...focusRing,
});

export const dayCellStaged = style({
  background: `${core.states.default} !important`,
  color: `${core.contrast} !important`,
});

export const dayCellToday = style({
  outline: `${core.strokeWeight} solid ${core.states.default}`,
  outlineOffset: '-2px',
});

export const dayCellOutsideMonth = style({
  opacity: '0.35',
});

export const dayCellDisabled = style({
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
