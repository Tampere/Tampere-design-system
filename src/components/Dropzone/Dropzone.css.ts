import { globalStyle, style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    background,
    cornerRadius,
    error,
    font,
    states,
    strokeWeight,
    text,
    components: { dropzone, input: inputVars, typography },
  },
} = vars;

// Applied both as Dropzone's own row-to-row gap and — via `classNames.root`
// on Input.Wrapper — as the wrapper's own root layout, so label, drop area,
// FileList and error all stack with one consistent gap instead of sitting
// flush at Mantine's default zero margins (see FileInput.css.ts `root`,
// which this mirrors). Uses `input.spacing.verticalSpacing`, the same token
// every other field in the library uses for this gap — `dropzone.spacing` is
// reserved for the drop area's own internal gap below, a different, larger
// value that must not leak into this outer stack.
export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: inputVars.spacing.verticalSpacing,
});

const areaBase = style({
  boxSizing: 'border-box',
  // Mantine's own root rule sets `border-radius: var(--dropzone-radius)`, which
  // defaults to the theme radius — and unlayered Vanilla Extract only outranks
  // it for properties we actually declare, so an undeclared one is simply
  // inherited. Figma's Effects/Corner-radius/Default is 0. Same explicit
  // override `Paper.css.ts` makes against its own Mantine primitive.
  borderRadius: cornerRadius.sharp,
  padding: `${dropzone.padding.vertical} ${dropzone.padding.horizontal}`,
  border: `${strokeWeight} solid ${dropzone.border}`,
  background: background.default,
  selectors: {
    // Mantine's Dropzone stamps `mod` boolean flags as data attributes on
    // the root (getBoxMod truthy values become `data-<key>="true"`) — the
    // exact names below (`data-accept`/`data-reject`) are what's rendered,
    // confirmed against @mantine/dropzone's own Dropzone.mjs source and
    // programmatically via a dispatched dragenter in Dropzone.stories.tsx's
    // DragOverStylesTheArea story, not merely assumed.
    // Derived styling, not Figma-specified — see the spec's "Gaps" section.
    '&[data-accept]': {
      borderColor: dropzone.dragOver.border,
      background: dropzone.dragOver.background,
    },
    '&[data-reject]': {
      borderColor: dropzone.dragReject.border,
    },
  },
});

// Mantine's Dropzone does NOT render children into the root — it nests them in
// its own `inner` div (`<div root><LoadingOverlay/><input/><div inner>{children}
// </div></div>`, Dropzone.mjs), and that div carries only `pointer-events` and
// `user-select`. Layout on the root therefore governs the gap between the hidden
// input and `inner`, never the gap between the heading, picker and status line —
// so the whole flex column has to be applied here, via `classNames.inner`, and
// the root left as a plain block that owns only the border, background and
// padding. Verified against @mantine/dropzone's source, not assumed.
export const areaInner = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: dropzone.spacing,
});

// Figma's `File input container` (6801:7171). It exists because the drop area
// does NOT have one uniform gap: 32px separates the heading from the picker,
// but only 16px separates the picker from the status line. A single flex `gap`
// on the area can't express both, so the picker and the status line are nested
// one level down with their own, smaller gap — the same nesting Figma uses.
// The 16px is `input.padding.vertical` because that is the variable Figma binds
// on the status line's container; it renders as a gap here only because we keep
// the area's bottom padding symmetric with its top (Figma's own container adds
// a further 16px below the text, which we deliberately don't reproduce).
export const fileUpload = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: inputVars.padding.vertical,
  // `areaInner` centres its children, so this wrapper is fit-content; without
  // the cap a long filename would widen it past the area instead of ellipsing.
  maxWidth: '100%',
});

export const area = styleVariants({
  default: [areaBase],
  error: [areaBase, { borderColor: error }],
  disabled: [areaBase, { borderColor: states.disabled }],
});

const titleBase = style({
  fontSize: typography.subheader.fontSize,
  fontFamily: typography.subheader.fontFamily,
  fontWeight: typography.subheader.fontWeight,
  lineHeight: typography.subheader.lineHeight,
  letterSpacing: font.letterSpacing,
  color: text.primary,
  margin: 0,
  textAlign: 'center',
  // Unlike the status line (a single-line-by-nature filename/count), a
  // custom `title` has room to wrap inside the drop area's 64px of
  // vertical padding — clamping it to one line with ellipsis would just
  // hide the rest of a longer heading for no reason. Let it wrap.
  overflowWrap: 'break-word',
});

export const title = styleVariants({
  default: [titleBase],
  error: [titleBase, { color: error }],
  disabled: [titleBase, { color: text.disabled }],
});

// Figma calls for the heading (not just the border) to go error-red while
// an unacceptable file is dragged over the area. `titleBase` stays present
// as its own class across every status variant (styleVariants composes
// rather than merging classes — verified against the rendered DOM), so this
// matches the heading regardless of the field's own default/error/disabled
// status; `areaBase` is likewise always present on the area regardless of
// its status variant.
globalStyle(`${areaBase}[data-reject] ${titleBase}`, {
  color: dropzone.dragReject.title,
});

const statusBase = style({
  display: 'block',
  textAlign: 'center',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: '100%',
  // Matches FileInput's status text (FileInput.css.ts `displayBase`) — same
  // token pair, so both controls render the status line at the same size at
  // every breakpoint instead of Dropzone silently inheriting Mantine's
  // default body text size.
  fontSize: inputVars.font.text.fontSize,
  lineHeight: inputVars.font.text.lineHeight,
  letterSpacing: font.letterSpacing,
});

export const status = styleVariants({
  default: [statusBase, { color: text.secondary }],
  error: [statusBase, { color: text.secondary }],
  disabled: [statusBase, { color: text.disabled }],
});
