import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: { components, states, text, focusRing, strokeWeight, background },
} = vars;

const labelFont = {
  fontFamily: components.chip.label.fontFamily,
  fontWeight: components.chip.label.fontWeight,
  lineHeight: components.chip.label.lineHeight,
};

// Mantine's Chip sets total height via `--chip-size` directly (no vertical
// padding of its own) and font-size via `--chip-fz` — these two, plus
// `--chip-radius`/`--chip-padding`/`--chip-spacing`, apply unconditionally on
// the base label rule. `--chip-bd`/`--chip-bg`/`--chip-color` do NOT — Mantine
// only reads those under an explicit `variant` (outline/filled), which we
// don't use, so border/background/text color are set directly below via
// `filterLabel`'s own `data-checked`/`data-disabled` selectors instead.
//
// `--chip-checked-padding` is a separate var Mantine swaps in for
// `padding-inline` under `[data-checked]` (its own default: a smaller
// sm-tier 10px, meant for its own default `icon`+built-in checkmark
// layout) — without setting it too, the checked state silently falls
// back to that unrelated Mantine default instead of our own horizontal
// padding, producing a visibly different left/right padding than every
// other (unchecked) chip. Figma's reference frame uses the same padding
// regardless of checked state, so this matches `--chip-padding` exactly.
export const filterRoot = style({
  vars: {
    '--chip-size': components.chip.height,
    '--chip-fz': components.chip.label.fontSize,
    '--chip-radius': components.chip.cornerRadius,
    '--chip-padding': components.chip.padding.horizontal,
    '--chip-checked-padding': components.chip.padding.horizontal,
    '--chip-spacing': components.chip.spacing,
  },
});

export const filterInput = style({});

// Wraps the whole filter-role chip so the leading-icon overlay below (a
// sibling of MantineChip, not nested inside its label) has a positioning
// context. A <span>, not <div>, so `.closest('div')`-based test queries
// (which walk up to Mantine's own root div) are unaffected.
export const filterWrapper = style({
  position: 'relative',
  display: 'inline-flex',
});

export const filterLabel = style({
  ...labelFont,
  // Spaces the built-in checkmark/selectedIcon from the label text — only
  // takes effect when checked, since that's the one state where Mantine
  // renders the icon wrapper and the text span as direct flex children of
  // this element. The leading-icon (unchecked) case reserves its own room
  // via `filterLabelWithLeadingIcon`'s `paddingLeft` instead (see below).
  gap: components.chip.spacing,
  selectors: {
    // Both attribute selectors below add a class + attribute (0,2,0), which
    // beats Mantine's own plain `.label` base rule (0,1,0) regardless of
    // stylesheet order — Mantine wraps its own attribute selectors in
    // `:where()` specifically so consumer overrides like this always win.
    //
    // Unchecked ("Outlined" in Figma) tracks `states.*` for BOTH border and
    // text/icon color together — Figma's Outlined variant always uses the
    // same primary-blue token for both, unlike the checked ("Default")
    // variant, whose text stays a constant `text.primary` regardless of
    // interaction state.
    '&:not([data-checked])': {
      border: `${strokeWeight} solid ${states.default}`,
      backgroundColor: background.default,
      color: states.default,
    },
    '&[data-checked]': {
      border: `${strokeWeight} solid ${states.default}`,
      backgroundColor: components.item.background.selected.default,
      color: text.primary,
    },
    // Neither `:hover` nor `:active` is asserted in tests — synthetic
    // pointer/mouse events (userEvent.pointer, fireEvent.mouseDown) don't
    // produce genuine browser hover/active state in this repo's
    // Playwright/Chromium test environment (verified: both were tried and
    // neither changes the computed style). Documented gap, same as
    // TextLink/LabeledIconButton's `:hover`.
    '&:not([data-disabled]):hover': { border: `${strokeWeight} solid ${states.hover}` },
    '&:not([data-checked]):not([data-disabled]):hover': { color: states.hover },
    '&[data-checked]:not([data-disabled]):hover': {
      backgroundColor: components.item.background.selected.hover,
    },
    '&:not([data-disabled]):active': { border: `${strokeWeight} solid ${states.active}` },
    '&:not([data-checked]):not([data-disabled]):active': { color: states.active },
    // Disabled differs by checked state in Figma: checked+disabled is a
    // flat `states.disabled` fill with no border at all (not a gray border
    // over the leftover selected-tint background); unchecked+disabled
    // keeps the white background with just a gray border, same as every
    // other unchecked state.
    '&[data-checked][data-disabled]': {
      border: 'none',
      backgroundColor: states.disabled,
      color: text.disabled,
    },
    '&:not([data-checked])[data-disabled]': {
      border: `${strokeWeight} solid ${states.disabled}`,
      color: text.disabled,
    },
    [`${filterInput}:focus-visible + &`]: { ...focusRing },
  },
});

export const tagRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: components.chip.height,
  borderRadius: components.chip.cornerRadius,
  paddingInline: components.chip.padding.horizontal,
  gap: components.chip.spacing,
  backgroundColor: components.chip.tagFill,
  color: text.primary,
  ...labelFont,
  fontSize: components.chip.label.fontSize,
  selectors: {
    '&[data-disabled]': { color: text.disabled },
  },
});

export const tagDismissIcon = style({
  color: text.secondary,
});

// Shared fixed-size slot for both the built-in checkmark/selectedIcon
// (via MantineChip's `iconWrapper` classNames slot) and the leading `icon`
// prop, so whichever icon a consumer passes renders identically sized
// regardless of that icon component's own default width.
//
// `inline-flex`/`verticalAlign` (not block `flex`) so this stays correct
// even outside a flex parent: it's always a direct flex child in practice
// (Mantine's own flex `label` when checked, `filterIconRow` below when
// showing a leading icon), but a block-level flex box would break out of
// plain inline flow and float above the text if that ever weren't true.
export const chipIcon = style({
  width: components.chip.iconSize,
  height: components.chip.iconSize,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  verticalAlign: 'middle',
  flexShrink: 0,
});

// CSS width/height on the root <svg> element override its own width/height
// presentation attributes, so this normalizes any icon to fill the slot
// above instead of rendering at its own default size and getting cropped
// by Mantine's overflow-hidden iconWrapper (the previous behaviour, since
// `--chip-icon-size` was never set and defaulted to Mantine's 12px `sm` tier).
globalStyle(`${chipIcon} svg`, {
  width: '100%',
  height: '100%',
});

// Reserves room for `filterIconOverlay` below when showing a leading icon,
// so the label text doesn't render underneath it. The *value* fully
// replaces `--chip-padding`'s padding-left (CSS longhands don't add), so
// it must restate the base padding, not just the icon+gap delta.
//
// This whole overlay approach (rather than nesting the icon inside
// Mantine's `children`) exists because nesting it hit a real, visible bug:
// Mantine wraps `children` in its own plain, non-flex <span>, which
// inherits `label`'s font metrics as its line-box strut. An inline
// flex-row icon+text wrapper placed inside that span is positioned via
// `vertical-align`, which aligns to a font-metric-derived point (half the
// x-height above the baseline) rather than true geometric center — visibly
// different from the checked/checkmark case, where Mantine renders the
// icon and text as genuine flex siblings of `label` with no such
// baseline math involved. Rendering the icon as an absolutely-positioned
// overlay (via `filterWrapper`) sidesteps inline layout entirely: its
// vertical position is computed the same way regardless of font metrics,
// and the label text renders through the exact same code path as the
// plain-text (no-icon) case, guaranteeing identical text positioning too.
export const filterLabelWithLeadingIcon = style({
  paddingLeft: `calc(${components.chip.padding.horizontal} + ${components.chip.iconSize} + ${components.chip.spacing})`,
});

// `left` accounts for the label's own border width: this overlay is
// positioned relative to `filterWrapper` (outside the label, at the pill's
// outer edge), but content inside the label starts after both the border
// *and* the padding, since the label uses `box-sizing: border-box`.
//
// Color tracks the same `states.*` progression as the label text (see
// `filterLabel`'s `:not([data-checked])` rules above) — being a sibling of
// `label`, not a descendant, this icon can't just inherit `currentColor`
// from it, so the same default/hover/active/disabled colors are restated
// here against `filterWrapper`'s own hover/active pseudo-state and its
// React-driven `data-disabled` (mirroring `tagRoot`'s pattern, since
// there's no `data-checked` to key off — this overlay only ever renders
// when unchecked in the first place, so that case doesn't apply here).
export const filterIconOverlay = style({
  position: 'absolute',
  top: '50%',
  left: `calc(${strokeWeight} + ${components.chip.padding.horizontal})`,
  transform: 'translateY(-50%)',
  pointerEvents: 'none',
  color: states.default,
  selectors: {
    [`${filterWrapper}:not([data-disabled]):hover &`]: { color: states.hover },
    [`${filterWrapper}:not([data-disabled]):active &`]: { color: states.active },
    [`${filterWrapper}[data-disabled] &`]: { color: text.disabled },
  },
});
