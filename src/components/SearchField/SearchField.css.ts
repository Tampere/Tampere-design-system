import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '@theme';

const {
  core,
  text,
  focusRing,
  components: { button: buttonVars, item, input: inputVars, searchField, typography },
} = vars;

export const buttonBase = style({
  backgroundColor: core.states.default,
  border: `${core.strokeWeight} solid ${core.states.default}`,
  padding: `${buttonVars.padding.vertical} ${buttonVars.padding.horizontal}`,
  selectors: {
    '&:focus-visible': {
      outline: `${core.strokeWeight} solid ${core.focus.visible}`,
    },
  },
});

export const button = styleVariants({
  default: [buttonBase],
  disabled: [
    buttonBase,
    {
      border: `${core.strokeWeight} solid ${core.states.disabled}`,
      pointerEvents: 'none',
    },
  ],
});

export const inputWrapper = style({
  flex: 1,
});

export const dropdown = style({
  backgroundColor: item.background.default,
  borderRight: `${inputVars.stroke.weight.default} solid ${core.divider}`,
  borderBottom: `${inputVars.stroke.weight.default} solid ${core.divider}`,
  borderLeft: `${inputVars.stroke.weight.default} solid ${core.divider}`,
  maxHeight: searchField.dropDownMaxHeight,
  overflow: 'auto',
});

export const option = style({
  listStyle: 'none',
  margin: typography.margin,
  fontSize: inputVars.font.label.fontSize,
  lineHeight: inputVars.font.label.lineHeight,
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
});

export const listOptions = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

globalStyle(`${option}[data-combobox-selected="true"]`, {
  background: item.background.selected.default,
  fontWeight: item.highlightFontWeight,
  color: text.primary,
});

globalStyle(`${option}[data-combobox-selected="true"]:hover`, {
  background: item.background.selected.focus,
  fontWeight: item.highlightFontWeight,
  color: text.primary,
});

globalStyle(`${option}[data-combobox-highlighted="true"]:focus-visible`, {
  ...focusRing,
  background: item.background.selected.focus,
  fontWeight: item.highlightFontWeight,
  color: text.primary,
});
