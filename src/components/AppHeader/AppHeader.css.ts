import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    divider,
    strokeWeight,
    background,
    components: { appHeader, typography },
  },
} = vars;

export const navList = style({
  display: 'flex',
  alignItems: 'center',
  gap: appHeader.spacing,
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const navItem = style({ display: 'flex' });

// Empty for now — Task 7 adds the @media rule that hides this above 1440px.
export const menuButton = style({});

export const root = style({
  display: 'flex',
  flexDirection: 'column',
  gap: appHeader.spacing,
  padding: `${appHeader.padding.vertical} ${appHeader.padding.horizontal}`,
  background: background.default,
  borderBottom: `${strokeWeight} solid ${divider}`,
});

export const row = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: appHeader.spacing,
});

export const leftSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: appHeader.spacing,
});

export const rightSection = style({
  display: 'flex',
  alignItems: 'center',
  gap: appHeader.spacing,
});

export const brandLink = style({ display: 'flex', alignItems: 'center' });

export const primaryLogo = style({
  height: appHeader.logo.primaryHeight,
  width: 'auto',
});

export const secondaryLogo = style({
  height: appHeader.logo.secondaryHeight,
  width: 'auto',
});

// Declared here so Task 6's import resolves; Task 7 adds the `@media` rules
// that make these two the actual inline-nav ↔ drawer switch.
export const inlineNav = style({});

export const siteName = style({
  fontSize: typography.h5.fontSize,
  fontFamily: typography.h5.fontFamily,
  fontWeight: typography.h5.fontWeight,
  lineHeight: typography.h5.lineHeight,
});

export const searchContainer = style({
  display: 'flex',
  maxWidth: appHeader.searchMaxWidth,
  width: '100%',
});
