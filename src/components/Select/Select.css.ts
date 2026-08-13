import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  primitives: { spacing },
  theme: {
    states,
    divider,
    background,
    text,
    components: { typography, input, item },
    focusRing,
  },
} = vars;

export const chevronOpen = style({
  transform: 'rotate(180deg)',
});

export const root = style({
  alignItems: 'center',
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
    color: states.error,
  },
]);

export const label = styleVariants({
  default: [textBase],
  disabled: [
    textBase,
    {
      color: text.disabled,
    },
  ],
  error: [errorTextBase],
});

export const helper = styleVariants({
  default: [
    textBase,
    {
      color: text.secondary,
    },
  ],
  disabled: [
    textBase,
    {
      color: text.disabled,
    },
  ],
  error: [errorTextBase],
});

export const errorText = style([errorTextBase, { paddingTop: input.spacing.verticalSpacing }]);

export const dropDown = style({
  border: `${input.stroke.weight.default} solid ${divider}`,
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
        background: background.default,
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
