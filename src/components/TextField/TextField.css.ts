import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  core,
  font,
  components: { input: inputVars, textField },
  text,
  focusRing,
} = vars;

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

// Optional left and right sections
export const section = style({
  position: 'absolute',
  zIndex: 1,
  display: 'flex',
  alignItems: 'center',
});

globalStyle(`${section}[data-position="left"]`, {
  left: inputVars.padding.horizontal,
});

globalStyle(`${section}[data-position="right"]`, {
  right: inputVars.padding.horizontal,
});

export const inputRoot = style({
  flex: 1,
  borderRadius: core.cornerRadius,
  fontSize: inputVars.font.text.fontSize,
  lineHeight: inputVars.font.text.lineHeight,
  letterSpacing: font.letterSpacing,
  minHeight: textField.minHeight,
  padding: `${inputVars.padding.vertical} ${inputVars.padding.horizontal}`,
  alignItems: 'flex-start',
  gap: inputVars.spacing.horizontalSpacing,
  border: `${inputVars.stroke.weight.default} solid ${core.states.default}`,
  background: core.background,
  selectors: {
    '&::placeholder': {
      color: text.secondary,
    },
    '&:hover': {
      border: `${inputVars.stroke.weight.default} solid ${core.states.hover}`,
      background: core.background,
    },
    '&:focus-visible': {
      background: core.background,
      ...focusRing,
    },
    '&:disabled': {
      border: `${inputVars.stroke.weight.default} solid ${core.states.disabled}`,
      background: core.backgroundDisabled,
    },
    '&:disabled::placeholder': {
      color: text.disabled,
    },
  },
});

export const inputPaddingVariant = styleVariants({
  left: {
    paddingLeft: `calc(${inputVars.padding.horizontal} * 3)`,
  },
  right: {
    paddingRight: `calc(${inputVars.padding.horizontal} * 3)`,
  },
  both: {
    paddingLeft: `calc(${inputVars.padding.horizontal} * 3)`,
    paddingRight: `calc(${inputVars.padding.horizontal} * 3)`,
  },
});

globalStyle(`${inputRoot}[data-error="true"]`, {
  border: `${inputVars.stroke.weight.default} solid ${core.states.error}`,
});

export const labelRoot = style({
  margin: textField.labelMargin,
  color: text.primary,
  fontSize: inputVars.font.label.fontSize,
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
  color: core.states.error,
});

export const errorRoot = style({
  fontSize: inputVars.font.helperText.fontSize,
  lineHeight: inputVars.font.helperText.lineHeight,
  color: core.states.error,
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
