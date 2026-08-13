import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    states,
    strokeWeight,
    focus,
    divider,
    background,
    text,
    focusRing,
    components: { button: buttonVars, item, input: inputVars, searchField, typography },
  },
} = vars;

export const buttonBase = style({
  backgroundColor: states.default,
  border: `${strokeWeight} solid ${states.default}`,
  padding: `${buttonVars.padding.vertical} ${buttonVars.padding.horizontal}`,
  selectors: {
    '&:focus-visible': {
      outline: `${strokeWeight} solid ${focus.visible}`,
    },
  },
});

export const button = styleVariants({
  default: [buttonBase],
  disabled: [
    buttonBase,
    {
      border: `${strokeWeight} solid ${states.disabled}`,
      pointerEvents: 'none',
    },
  ],
});

export const inputWrapper = style({
  flex: 1,
});

export const dropdown = style({
  backgroundColor: item.background.default,
  borderRight: `${inputVars.stroke.weight.default} solid ${divider}`,
  borderBottom: `${inputVars.stroke.weight.default} solid ${divider}`,
  borderLeft: `${inputVars.stroke.weight.default} solid ${divider}`,
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
      background: background.default,
    },
  },
});

export const listOptions = style({
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

// The search trigger icon scales with the responsive control size: its width
// tracks the button line-height token, so it shrinks with the field instead
// of staying a fixed 24px. Mirrors DateField.css.ts's identical `triggerIcon`.
export const triggerIcon = style({
  width: buttonVars.lineHeight,
  height: 'auto',
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
