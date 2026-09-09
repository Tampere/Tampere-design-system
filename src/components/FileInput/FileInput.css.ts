import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    background,
    error,
    font,
    inputStates,
    states,
    text,
    components: { controlHeight, input: inputVars },
  },
} = vars;

// Applied both as the FileInput's own row-to-row gap and — via
// `classNames.root` on Input.Wrapper — as the wrapper's own root layout, so
// label, control row, FileList and error all stack with one consistent gap
// instead of sitting flush at Mantine's default zero margins.
export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: inputVars.spacing.verticalSpacing,
});

// Figma 4761:6394: the button and the display area sit flush, sharing one seam.
export const control = style({
  display: 'flex',
  alignItems: 'stretch',
});

const displayBase = style({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  // Lets the status text child (see `statusText` below) actually shrink for
  // ellipsis instead of pushing this box wider — a flex item's default
  // min-width is its content size, not 0.
  minWidth: 0,
  boxSizing: 'border-box',
  height: controlHeight,
  padding: `${inputVars.padding.vertical} ${inputVars.padding.horizontal}`,
  // All four sides, the left included: Figma draws the seam as this box's own
  // left border in every state (`#52525b` default 4761:6394, `#ae1e20` error
  // 6751:6772, `#c9c9ce` disabled 6747:9526 — sampled from the renders). It
  // reads as a subtle detail while the button beside it is solid blue, but
  // it's the only thing dividing the two halves once the button is disabled
  // and takes the same `background.disabled` fill as this box.
  border: `${inputVars.stroke.weight.default} solid ${inputStates.default}`,
  background: background.default,
  color: text.secondary,
  fontSize: inputVars.font.text.fontSize,
  lineHeight: inputVars.font.text.lineHeight,
  letterSpacing: font.letterSpacing,
});

export const display = styleVariants({
  default: [displayBase],
  error: [displayBase, { borderColor: error }],
  // Figma State=Disabled: Background/disabled fill, Text/Disabled text,
  // Common/Disabled border.
  disabled: [
    displayBase,
    { background: background.disabled, color: text.disabled, borderColor: states.disabled },
  ],
});

// `text-overflow` is only defined for block containers — it has no effect on
// a flex container itself (`display` above), so the truncating box has to be
// this separate block-level child instead. `minWidth: 0` lets it actually
// shrink below its own text's natural width when space runs out.
export const statusText = style({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  minWidth: 0,
});
