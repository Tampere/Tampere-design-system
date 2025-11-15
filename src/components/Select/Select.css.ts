import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  spacing,
  core,
  font,
  text,
  components: { typography, input, textField, item },
  focusRing,
} = vars;

export const chevronOpen = style({
  transform: 'rotate(180deg)',
});

export const root = style({
  alignItems: 'center',
});

export const inputText = style({
  color: text.secondary,
});

const wrapperBase = style([
  inputText,
  {
    flex: 1,
    borderRadius: core.cornerRadius,
    fontSize: input.font.label.fontSize,
    lineHeight: input.font.text.lineHeight,
    letterSpacing: font.letterSpacing,
    minHeight: textField.minHeight,
    padding: `${input.padding.vertical} ${input.padding.horizontal}`,
    alignItems: 'flex-start',
    gap: input.spacing.horizontalSpacing,
  },
]);

export const inputWrapper = styleVariants({
  default: [
    wrapperBase,
    {
      pointerEvents: 'all',
      cursor: 'pointer',
      border: `${input.stroke.weight.default} solid ${core.states.default}`,
      background: core.background,
      selectors: {
        '&::placeholder': {
          color: text.secondary,
        },
        '&:hover': {
          border: `${input.stroke.weight.default} solid ${core.states.hover}`,
          background: core.background,
        },
        '&:focus-visible': {
          background: core.background,
          ...focusRing,
        },
      },
    },
  ],
  disabled: [
    wrapperBase,
    {
      border: `${input.stroke.weight.default} solid ${core.states.disabled}`,
      background: core.backgroundDisabled,
      pointerEvents: 'none',
    },
  ],
  error: [
    wrapperBase,
    {
      border: `${input.stroke.weight.default} solid ${core.states.error}`,
    },
  ],
});

export const inputField = style({
  paddingRight: `calc(${input.padding.horizontal} * 5)`,
});

const textBase = style({
  margin: typography.margin,
  fontSize: input.font.label.fontSize,
  lineHeight: input.font.label.lineHeight,
});

const errorTextBase = style([
  textBase,
  {
    color: core.states.error,
  },
]);

export const label = styleVariants({
  default: [textBase],
  disabled: [
    textBase,
    {
      color: vars.text.disabled,
    },
  ],
  error: [errorTextBase],
});

export const helper = styleVariants({
  default: [
    textBase,
    {
      color: vars.text.secondary,
    },
  ],
  disabled: [
    textBase,
    {
      color: vars.text.disabled,
    },
  ],
  error: [errorTextBase],
});

export const errorText = style([errorTextBase, { paddingTop: input.spacing.verticalSpacing }]);

export const dropDown = style({
  border: `${input.stroke.weight.default} solid ${core.divider}`,
  borderTop: 'none',
});

export const listOptions = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

const optionBase = style({
  listStyle: 'none',
});

export const dropDownOption = style([
  optionBase,
  textBase,
  {
    selectors: {
      '&:hover': {
        background: item.background.hover,
      },

      '&:active': {
        color: text.secondary,
        fontWeight: item.highlightFontWeight,
      },
      '&:focus-visible': {
        ...focusRing,
        background: core.background,
      },
    },
  },
]);

globalStyle(`${dropDownOption}[data-combobox-selected="true"]`, {
  background: item.background.selected.default,
  fontWeight: item.highlightFontWeight,
  color: text.primary,
});

globalStyle(`${dropDownOption}[data-combobox-selected="true"]:hover`, {
  background: item.background.selected.focus,
  fontWeight: item.highlightFontWeight,
  color: text.primary,
});

globalStyle(`${dropDownOption}[data-combobox-highlighted="true"]:focus-visible`, {
  ...focusRing,
  background: item.background.selected.focus,
  fontWeight: item.highlightFontWeight,
  color: text.primary,
});

export const rightSectionContainer = style({
  gap: spacing[1],
});
