import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { button, controlHeight, typography },
    font,
    states,
    text: textColors,
    contrast,
    background: { disabled: backgroundDisabled },
    strokeWeight,
    focusRing,
    cornerRadius,
  },
} = vars;

const root = style({
  width: 'fit-content',
  // Fixed, responsive height shared with inputs; border-box absorbs each variant's border
  // so filled/outlined/text render identical heights (issue #79).
  height: controlHeight,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: button.fontSize,
  // No dedicated weight token (per project convention) — Figma's button label
  // reuses Subheader's Semi-Bold weight, same override Chip's label uses.
  fontWeight: typography.subheader.fontWeight,
  lineHeight: button.lineHeight,
  letterSpacing: font.letterSpacing,
  padding: `${button.padding.vertical} ${button.padding.horizontal}`,
});

const filled = style({
  background: states.default,
  color: contrast,
  selectors: {
    '&:hover': {
      background: states.hover,
    },
    '&:focus-visible': {
      background: states.focus,
      ...focusRing,
    },
    '&:active': {
      background: states.active,
    },
    '&:disabled': {
      color: textColors.disabled,
      background: backgroundDisabled,
      cursor: 'default',
    },
  },
});

const outlined = style({
  color: states.default,
  border: `${strokeWeight} solid ${states.default}`,
  selectors: {
    '&:hover': {
      border: `${strokeWeight} solid ${states.hover}`,
    },
    '&:focus-visible': {
      ...focusRing,
    },
    '&:active': {
      color: states.active,
      border: `${strokeWeight} solid ${states.active}`,
    },
    '&:disabled': {
      // Figma's disabled label color is `text/disabled`; the border stays on
      // `states.disabled` (Figma's `Common/Disabled`) — same value, different token.
      color: textColors.disabled,
      border: `${strokeWeight} solid ${states.disabled}`,
      cursor: 'default',
    },
  },
});

const text = style({
  color: states.default,
  borderBottom: `${strokeWeight} solid transparent`,
  selectors: {
    '&:hover': {
      borderBottom: `${strokeWeight} solid ${states.hover}`,
    },
    '&:focus-visible': {
      borderBottom: `${strokeWeight} solid ${states.hover}`,
      ...focusRing,
    },
    '&:active': {
      borderBottom: `${strokeWeight} solid ${states.active}`,
      color: states.active,
    },
    '&:disabled': {
      color: textColors.disabled,
      cursor: 'default',
    },
  },
});

export const variants = styleVariants({
  filled: [root, filled],
  outlined: [root, outlined],
  text: [root, text],
});

// Orthogonal to `variants` above — applied alongside a variant class, not instead of it,
// since corner shape (issue #73) is independent of fill/border treatment in Figma.
export const pill = style({ borderRadius: cornerRadius.rounded });

export const content = style({
  alignItems: 'center',
  gap: button.spacing,
});

export const iconWrapper = style({
  width: button.lineHeight,
  height: button.lineHeight,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: '0',
});
