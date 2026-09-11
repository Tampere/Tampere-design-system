import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';
import { breakpoint } from '../../theme/tokens/breakpoint';

const {
  theme: {
    divider,
    strokeWeight,
    background,
    components: { appHeader, typography },
  },
} = vars;

// Deliberately the real viewport token, unlike Linkbox's component-local
// `containerQueryBreakpoint`: AppHeader is page chrome and its collapse point
// *is* the site's responsive grid (Figma node 5870:42434 — inline nav exists
// only at 1440), so it should follow xl if xl is ever retuned. A `var()`
// reference cannot work here; media conditions require a literal length.
const inlineNavWidth = `screen and (min-width: ${breakpoint.xl.appWidth})`;
const wideEnoughForSecondaryLogo = `screen and (min-width: ${breakpoint.sm.appWidth})`;

export const navList = style({
  display: 'flex',
  alignItems: 'center',
  gap: appHeader.spacing,
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const navItem = style({ display: 'flex' });

export const menuButton = style({
  // `!important`: Button's own `root` class sets an unconditional `display:
  // flex` at the same (0,1,0) specificity; without it, whichever class's CSS
  // happens to land later in the bundle wins, regardless of this media query.
  '@media': { [inlineNavWidth]: { display: 'none !important' } },
});

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
  display: 'none',
  height: appHeader.logo.secondaryHeight,
  width: 'auto',
  '@media': { [wideEnoughForSecondaryLogo]: { display: 'block' } },
});

export const inlineNav = style({
  display: 'none',
  '@media': { [inlineNavWidth]: { display: 'block' } },
});

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
