import { globalStyle, style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    divider,
    background,
    text,
    components: { typography, input, item, select },
    focusRing,
  },
} = vars;

export const chevronOpen = style({
  transform: 'rotate(180deg)',
});

const textBase = style({
  margin: typography.margin,
  fontSize: input.font.label.fontSize,
  lineHeight: input.font.label.lineHeight,
});

export const dropDown = style({
  border: `${input.stroke.weight.default} solid ${divider}`,
  borderTop: 'none',
});

export const listOptions = style({
  maxHeight: select.dropDownMaxHeight,
  overflowY: 'auto',
});

export const dropDownOption = style([
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

export const emptyMessage = style([
  textBase,
  {
    color: text.secondary,
  },
]);

export const dropDownGroupLabel = style([
  textBase,
  {
    color: text.secondary,
    fontWeight: item.highlightFontWeight,
  },
]);
