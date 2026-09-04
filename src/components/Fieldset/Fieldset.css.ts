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
    divider,
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
// default (per Figma, #70) stays borderless.
export const withBorder = style({
  borderWidth: strokeWeight,
  borderStyle: 'solid',
  borderColor: divider,
});

// Same `sharp`/`pill` pair as Paper's `radius` prop — `sharp` is already
// `root`'s own default, so only `pill` needs its own class.
export const pill = style({ borderRadius: cornerRadius.rounded });

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
