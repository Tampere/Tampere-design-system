import { style, styleVariants, globalStyle } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { button, controlHeight, typography },
    font,
    states,
    text: textColors,
    contrast,
    background: { disabled: backgroundDisabled },
    strokeWeight,
    focusRing,
    cornerRadius,
  },
} = vars;

const root = style({
  width: 'fit-content',
  // Fixed, responsive height shared with inputs; border-box absorbs each variant's border
  // so primary/secondary/tertiary render identical heights (issue #79).
  height: controlHeight,
  boxSizing: 'border-box',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: button.fontSize,
  // No dedicated weight token (per project convention) — Figma's button label
  // reuses Subheader's Semi-Bold weight, coincidentally matching Chip's label
  // weight (Chip hardcodes its own '600' rather than sharing this token).
  fontWeight: typography.subheader.fontWeight,
  lineHeight: button.lineHeight,
  letterSpacing: font.letterSpacing,
  padding: `${button.padding.vertical} ${button.padding.horizontal}`,
});

const primary = style({
  background: states.default,
  color: contrast,
  selectors: {
    '&:hover': {
      background: states.hover,
    },
    '&:focus-visible': {
      background: states.focus,
      ...focusRing,
    },
    '&:active': {
      background: states.active,
    },
    '&:disabled': {
      color: textColors.disabled,
      background: backgroundDisabled,
      cursor: 'default',
    },
  },
});

const secondary = style({
  color: states.default,
  border: `${strokeWeight} solid ${states.default}`,
  selectors: {
    '&:hover': {
      border: `${strokeWeight} solid ${states.hover}`,
    },
    '&:focus-visible': {
      ...focusRing,
    },
    '&:active': {
      color: states.active,
      border: `${strokeWeight} solid ${states.active}`,
    },
    '&:disabled': {
      // Figma's disabled label color is `text/disabled` (#686872) — visibly darker
      // than the border's `states.disabled` (Figma's `Common/Disabled`, #c9c9ce).
      color: textColors.disabled,
      border: `${strokeWeight} solid ${states.disabled}`,
      cursor: 'default',
    },
  },
});

const tertiary = style({
  color: states.default,
  borderBottom: `${strokeWeight} solid transparent`,
  selectors: {
    '&:hover': {
      borderBottom: `${strokeWeight} solid ${states.hover}`,
    },
    '&:focus-visible': {
      borderBottom: `${strokeWeight} solid ${states.hover}`,
      ...focusRing,
    },
    '&:active': {
      borderBottom: `${strokeWeight} solid ${states.active}`,
      color: states.active,
    },
    '&:disabled': {
      color: textColors.disabled,
      cursor: 'default',
    },
  },
});

export const variants = styleVariants({
  primary: [root, primary],
  secondary: [root, secondary],
  tertiary: [root, tertiary],
});

// Orthogonal to `variants` above — applied alongside a variant class, not instead of it,
// since corner shape (issue #73) is independent of fill/border treatment in Figma.
export const pill = style({ borderRadius: cornerRadius.rounded });

// Tertiary has no border box — only a bottom border shown on hover/focus/active — so
// rounding its corners would bow that border into an arc instead of a straight
// underline. Figma doesn't pair `Corner-radius: Rounded` with Tertiary either, so
// neutralize `pill` specifically for tertiary. The compound selector's specificity
// (0,2,0) beats `pill`'s single-class (0,1,0) without needing `!important`.
globalStyle(`${tertiary}${pill}`, { borderRadius: 0 });

// Figma's `Icon-only: Yes` variant uses uniform padding on all sides (`spacing/small`,
// same value as `button.padding.vertical`) instead of the wider horizontal padding a
// labeled button gets — overrides `root`'s asymmetric padding, defined after it so it
// wins on source order (same-specificity single-class selectors).
export const iconOnly = style({ padding: button.padding.vertical });

export const content = style({
  alignItems: 'center',
  gap: button.spacing,
});

export const iconWrapper = style({
  width: button.lineHeight,
  height: button.lineHeight,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: '0',
});
