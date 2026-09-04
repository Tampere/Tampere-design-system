import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { forms, input, typography },
    states,
    text,
    font,
    cornerRadius,
    strokeWeight,
    inputStates,
  },
} = vars;

export const root = style({
  border: 'none',
  borderRadius: cornerRadius.sharp,
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: forms.fieldset.spacing,
});

// Figma's "Inputs and forms/Input label" style — same recipe as TextField's
// own label (TextField.css.ts's `labelRoot`): P2 size, Subheader/Semi-Bold
// weight (no dedicated weight token of its own, per project convention),
// text.primary color. Mantine's bare `<legend>` has no type-scale styling of
// its own, so this must be applied explicitly.
export const legend = style({
  margin: 0,
  // A flex `<fieldset>`'s `<legend>` is excluded from the flex formatting
  // context per the CSS Fieldsets spec (browsers wrap the rest of the
  // children in an anonymous "fieldset content box"), so `root`'s flex `gap`
  // never applies between the legend and its next sibling — only among the
  // children after it. Close that gap explicitly here instead.
  marginBottom: forms.fieldset.spacing,
  color: text.primary,
  fontSize: input.font.label.fontSize,
  fontWeight: typography.subheader.fontWeight,
  lineHeight: input.font.label.lineHeight,
  letterSpacing: font.letterSpacing,
  display: 'flex',
  alignItems: 'center',
});

export const asterisk = style({
  color: states.error,
  marginLeft: forms.fieldset.requiredIndicatorGap,
});

// Opt-in bordered variant (Mantine's own default Fieldset look) — TREDS's own
// default (per Figma, #70) stays borderless. No Figma spec exists for this
// addition, so the padding reuses `forms.spacing` — the only pre-existing
// token actually named for general form-container spacing (sitting unused
// next to `forms.fieldset.spacing`) — rather than hugging the border with 0
// padding or inventing a new token with no source of truth to check it against.
// Border color matches the resting border color inputs use (`inputStates.default`),
// not the lighter `divider` token, so the box reads as part of the same form
// surface family as the fields inside it. `paddingTop` stays 0: a flex
// `<fieldset>`'s `<legend>` always renders flush with the fieldset's own top
// edge regardless of padding-top (browsers exclude it from the padding box
// entirely, per the CSS Fieldsets spec — see `legend`'s own comment above),
// so a nonzero padding-top here would only double up with the legend's
// `marginBottom`, not give the legend itself any more clearance from the top
// border.
export const withBorder = style({
  borderWidth: strokeWeight,
  borderStyle: 'solid',
  borderColor: inputStates.default,
  paddingTop: 0,
  paddingRight: forms.spacing,
  paddingBottom: forms.spacing,
  paddingLeft: forms.spacing,
});

export const childrenWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: forms.fieldset.fieldGroupSpacing,
});

// Groups same-type selection controls (Checkbox/RadioButton items) into a
// single Fieldset child, matching Figma's "Checkbox group"/"Radio button
// group" sub-components. TREDS has no dedicated CheckboxGroup/RadioGroup
// component yet, so this is used directly by Fieldset.stories.tsx's doc
// examples. Figma's `Forms/Selection-items-spacing` aliases to the exact same
// `Breakpoint/Spacing/Small` chain as `Components/Fieldset/Spacing` (16px at
// 1024+, 12px at 768 and below) — reuse that token, not the larger
// `fieldGroupSpacing` (24/16px) meant for grouping distinct field types.
export const selectionGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: forms.fieldset.spacing,
});

// Shared with TextField/TextArea's own helper text style (Figma's "Inputs and
// forms/Helper text" — same size/line-height across all form components).
const descriptionFont = {
  margin: 0, // reset the <p>'s default UA margin — spacing is via the root flex `gap`
  fontSize: input.font.helperText.fontSize,
  lineHeight: input.font.helperText.lineHeight,
};

export const helperText = style({ ...descriptionFont, color: text.secondary });

export const errorText = style({ ...descriptionFont, color: states.error });
