import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { typography, link, breadcrumbs: bcVars },
    text,
    font,
  },
  primitives: { spacing },
} = vars;

export const mobileWrapper = style({
  alignItems: 'center',
  gap: link.spacing,
});

export const arrowLeftIcon = style({
  width: typography.p2.fontSize,
  height: typography.p2.fontSize,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: '0',
});

export const breadcrumbs = style({
  display: 'flex',
  alignItems: 'center',
  gap: spacing[1],
});

export const breadcrumbsList = style({
  display: 'inline-flex',
  listStyle: 'none',
});

export const breadcrumbItem = style({
  fontSize: typography.p2.fontSize,
  fontStyle: 'normal',
  fontWeight: typography.p2.fontWeight,
  lineHeight: typography.p2.lineHeight,
  textDecorationLine: 'underline',
  textDecorationStyle: 'solid',
  textDecorationSkipInk: 'auto',
  textDecorationThickness: 'auto',
  textUnderlineOffset: 'auto',
  textUnderlinePosition: 'from-font',
  display: 'inline-flex',
  alignItems: 'center',
  color: text.secondary,
});

export const breadcrumbListItem = style([
  breadcrumbItem,
  {
    selectors: {
      '&:last-child': {
        textDecoration: 'none',
        color: text.primary,
        fontSize: typography.p2.fontSize,
        fontWeight: bcVars.activePageFontWeight,
        lineHeight: typography.p2.lineHeight,
        wordWrap: 'break-word',
        pointerEvents: 'none',
      },
    },
  },
]);

export const separator = style({
  margin: `0 ${spacing[1]}`,
  color: text.secondary,
  fontFeatureSettings: "'liga' off, 'clig' off",
  fontSize: typography.p2.fontSize,
  fontStyle: 'normal',
  fontWeight: typography.p2.fontWeight,
  lineHeight: typography.p2.lineHeight,
  letterSpacing: font.letterSpacing,
});
