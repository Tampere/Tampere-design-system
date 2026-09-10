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

// Input.Wrapper stacks label, drop area, FileList and error at Mantine's
// default zero margins, so the gap has to come from here. Deliberately
// `input.spacing.verticalSpacing` and not `dropzone.spacing`, which is the
// drop area's own larger internal gap and must not leak into this outer stack.
export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: inputVars.spacing.verticalSpacing,
});

const areaBase = style({
  boxSizing: 'border-box',
  // Mantine's own root rule sets `border-radius: var(--dropzone-radius)`, and
  // unlayered Vanilla Extract outranks it only for properties we declare — an
  // undeclared one is inherited. Figma's Effects/Corner-radius/Default is 0.
  borderRadius: cornerRadius.sharp,
  padding: `${dropzone.padding.vertical} ${dropzone.padding.horizontal}`,
  border: `${strokeWeight} solid ${dropzone.border}`,
  background: background.default,
  selectors: {
    // Mantine's Dropzone stamps `mod` boolean flags as data attributes on the
    // root (getBoxMod truthy values become `data-<key>="true"`), which is what
    // makes these `data-accept`/`data-reject`.
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
// padding.
export const areaInner = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: dropzone.spacing,
});

// Figma's `File input container` (6801:7171). The drop area does NOT have one
// uniform gap — 32px heading-to-picker, 16px picker-to-status — and a single
// flex `gap` can't express both, so these two nest one level down with their
// own, as Figma nests them. The 16px is the variable Figma binds there.
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
  // A custom `title` has room to wrap inside the drop area's 64px of vertical
  // padding, so it isn't clamped to one line the way the status line is.
  overflowWrap: 'break-word',
});

export const title = styleVariants({
  default: [titleBase],
  error: [titleBase, { color: error }],
  disabled: [titleBase, { color: text.disabled }],
});

// Figma calls for the heading, not just the border, to go error-red while an
// unacceptable file is dragged over. `styleVariants` composes rather than
// merges classes, so `areaBase`/`titleBase` stay present under every status
// variant and this selector matches in all of them.
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
  // Without these the status line silently inherits Mantine's default body
  // text size, at a different size from FileInput's.
  fontSize: inputVars.font.text.fontSize,
  lineHeight: inputVars.font.text.lineHeight,
  letterSpacing: font.letterSpacing,
});

export const status = styleVariants({
  default: [statusBase, { color: text.secondary }],
  error: [statusBase, { color: text.secondary }],
  disabled: [statusBase, { color: text.disabled }],
});
