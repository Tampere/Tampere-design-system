import { style, globalStyle } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: { components, text, contrast, cornerRadius },
} = vars;

// `height` and `label` stay on `components.chip.*`: Figma's Badge binds the
// `Chip/Label` composite itself, so the two must move together.
export const badgeRoot = style({
  display: 'inline-flex',
  alignItems: 'center',
  height: components.chip.height,
  borderRadius: cornerRadius.rounded,
  paddingInline: components.badge.padding.horizontal,
  gap: components.badge.spacing,
  fontFamily: components.chip.label.fontFamily,
  fontWeight: components.chip.label.fontWeight,
  lineHeight: components.chip.label.lineHeight,
  fontSize: components.chip.label.fontSize,
  backgroundColor: components.badge.background.neutral,
  color: text.primary,
  selectors: {
    '&[data-status="info"]': {
      backgroundColor: components.badge.background.info,
      color: contrast,
    },
    '&[data-status="success"]': {
      backgroundColor: components.badge.background.success,
      color: contrast,
    },
    // Warning keeps `text.primary` (black) — unlike info/success/error, the
    // yellow fill is too light for white text to clear WCAG AA contrast.
    '&[data-status="warning"]': {
      backgroundColor: components.badge.background.warning,
      color: text.primary,
    },
    '&[data-status="error"]': {
      backgroundColor: components.badge.background.error,
      color: contrast,
    },
  },
});

// Shared fixed-size slot for the leading icon, same purpose as Chip's
// `chipIcon` — normalizes whatever icon a consumer passes to the Figma
// spec's 18×18px size regardless of that icon component's own default width.
export const badgeIcon = style({
  width: components.badge.iconSize,
  height: components.badge.iconSize,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
});

globalStyle(`${badgeIcon} svg`, {
  width: '100%',
  height: '100%',
});
