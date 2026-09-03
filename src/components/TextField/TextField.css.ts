import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  primitives: { spacing },
  theme: {
    states,
    font,
    components: { input: inputVars, textField, controlHeight, typography, iconButton },
    text,
    focusRing,
    cornerRadius: { sharp: cornerRadius },
    background,
    inputStates,
  },
} = vars;

// Width of one IconButton, as rendered in a section: its min touch target plus its own padding.
const iconButtonWidth = `calc(${iconButton.minTouchTarget} + ${iconButton.padding} * 2)`;

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: inputVars.spacing.verticalSpacing,
});

export const wrapper = style({
  display: 'flex',
  alignSelf: 'stretch',
  alignItems: 'center',
  position: 'relative', // For left and right sections positioning
  flex: 1,
});

// Container for input and endInstance
export const inputContainer = style({
  display: 'flex',
});

export const section = style({
  position: 'absolute',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
  gap: spacing[1],
});

globalStyle(`${section}[data-position="left"]`, {
  left: inputVars.padding.horizontal,
});

globalStyle(`${section}[data-position="right"]`, {
  right: inputVars.padding.horizontal,
});

export const inputRoot = style({
  flex: 1,
  borderRadius: cornerRadius,
  fontSize: inputVars.font.text.fontSize,
  lineHeight: inputVars.font.text.lineHeight,
  letterSpacing: font.letterSpacing,
  // Fixed, responsive height shared with buttons; border-box absorbs the stroke-weight border
  // so the input matches button variants at every breakpoint (issue #79).
  height: controlHeight,
  boxSizing: 'border-box',
  padding: `${inputVars.padding.vertical} ${inputVars.padding.horizontal}`,
  alignItems: 'center',
  gap: inputVars.spacing.horizontalSpacing,
  border: `${inputVars.stroke.weight.default} solid ${inputStates.default}`,
  background: background.default,
  selectors: {
    '&::placeholder': {
      color: text.secondary,
    },
    '&:hover': {
      border: `${inputVars.stroke.weight.default} solid ${states.hover}`,
      background: background.default,
    },
    '&:focus-visible': {
      border: `${inputVars.stroke.weight.focus} solid ${states.focus}`,
      background: background.default,
      ...focusRing,
    },
    '&:disabled': {
      border: `${inputVars.stroke.weight.default} solid ${states.disabled}`,
      background: background.disabled,
    },
    '&:disabled::placeholder': {
      color: text.disabled,
    },
  },
});

export const leftSectionPadding = style({
  paddingLeft: `calc(${inputVars.padding.horizontal} * 3)`,
});

export const rightSectionPadding = styleVariants({
  single: {
    paddingRight: `calc(${inputVars.padding.horizontal} * 3)`,
  },
  double: {
    paddingRight: `calc(${inputVars.padding.horizontal} + ${iconButtonWidth} * 2 + ${spacing[1]} + ${inputVars.spacing.horizontalSpacing})`,
  },
});

globalStyle(`${inputRoot}[data-error="true"]`, {
  border: `${inputVars.stroke.weight.default} solid ${states.error}`,
});

export const labelRoot = style({
  margin: textField.labelMargin,
  color: text.primary,
  fontSize: inputVars.font.label.fontSize,
  // Figma's Semi-Bold label style has no dedicated weight token of its own —
  // reuse typography.subheader.fontWeight, per project convention.
  fontWeight: typography.subheader.fontWeight,
  lineHeight: inputVars.font.label.lineHeight,
  letterSpacing: font.letterSpacing,
});

export const descriptionRoot = style({
  margin: textField.labelMargin,
  color: text.secondary,
  fontSize: inputVars.font.helperText.fontSize,
  lineHeight: inputVars.font.helperText.lineHeight,
  letterSpacing: font.letterSpacing,
  selectors: {
    '&:disabled': {
      color: text.disabled,
    },
  },
});

export const disabledText = style({
  color: text.disabled,
});

export const errorText = style({
  color: states.error,
});

export const errorRoot = style({
  fontSize: inputVars.font.helperText.fontSize,
  lineHeight: inputVars.font.helperText.lineHeight,
  color: states.error,
  margin: textField.labelMargin,
});

export const input = styleVariants({
  default: [inputRoot],
  disabled: [inputRoot, disabledText],
  error: [inputRoot],
});

export const label = styleVariants({
  default: [labelRoot],
  disabled: [labelRoot, disabledText],
  error: [labelRoot, errorText],
});

export const description = styleVariants({
  default: [descriptionRoot],
  disabled: [descriptionRoot, disabledText],
  error: [descriptionRoot, errorText],
});
