import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { forms, input },
    states,
    text,
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

// Shared with TextField/TextArea's own helper text style (Figma's "Inputs and
// forms/Helper text" — same size/line-height across all form components).
const descriptionFont = {
  margin: 0, // reset the <p>'s default UA margin — spacing is via the root flex `gap`
  fontSize: input.font.helperText.fontSize,
  lineHeight: input.font.helperText.lineHeight,
};

export const helperText = style({ ...descriptionFont, color: text.secondary });

export const errorText = style({ ...descriptionFont, color: states.error });
