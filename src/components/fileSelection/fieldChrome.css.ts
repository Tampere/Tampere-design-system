import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    error,
    font,
    text,
    components: { input: inputVars, typography },
  },
} = vars;

const labelBase = style({
  color: text.primary,
  fontSize: inputVars.font.label.fontSize,
  // Figma's Semi-Bold label style has no dedicated weight token — reuse
  // typography.subheader.fontWeight, matching TextField.
  fontWeight: typography.subheader.fontWeight,
  lineHeight: inputVars.font.label.lineHeight,
  letterSpacing: font.letterSpacing,
});

export const label = styleVariants({
  default: [labelBase],
  error: [labelBase, { color: error }],
  disabled: [labelBase, { color: text.disabled }],
});

// Mantine renders both the description and the error as `<p>` (InputDescription
// /InputError pass `component: "p"`), and its own classes zero the UA margin —
// but `unstyled` on Input.Wrapper drops those classes, and Mantine's global
// reset only zeroes `body`, never `p`. Without this the browser's `1em 0` lands
// on both, adding ~18px above AND below the helper text on top of the root's
// 8px flex gap (margins don't collapse in a flex column). TextField solves the
// same problem with `margin: textField.labelMargin`; the literal here is a UA
// reset rather than a design value, like `Dropzone.css.ts`'s heading.
// The label needs no reset — Mantine renders it as `<label>`, which has none.
const descriptionBase = style({
  margin: 0,
  color: text.secondary,
  fontSize: inputVars.font.helperText.fontSize,
  lineHeight: inputVars.font.helperText.lineHeight,
  letterSpacing: font.letterSpacing,
});

export const description = styleVariants({
  default: [descriptionBase],
  // Matches TextField.css.ts: helper text reddens in the error state too, not
  // just the label and the message itself, so a form mixing TextField with a
  // file control doesn't show two different conventions for the same state.
  error: [descriptionBase, { color: error }],
  disabled: [descriptionBase, { color: text.disabled }],
});

// Same `<p>` UA-margin reset as `descriptionBase` above.
export const errorMessage = style({
  margin: 0,
  color: error,
  fontSize: inputVars.font.helperText.fontSize,
  lineHeight: inputVars.font.helperText.lineHeight,
  letterSpacing: font.letterSpacing,
});

// Screen-reader-only text — visually hidden but still announced. Mirrors
// TextLink.css.ts's/DateField.css.ts's `visuallyHidden` (no shared helper
// exists yet). Shared here between FileInput and Dropzone, which both need
// somewhere to park a consumer's `aria-label` text as a real DOM node so it
// can join the picker Button's `aria-labelledby` — see FileInput.tsx.
export const visuallyHidden = style({
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
});
