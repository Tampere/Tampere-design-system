import { rem } from '@mantine/core';
import { primitives } from './primitives';
import { brand } from './brand';
import { breakpoint, type BreakpointKey } from './breakpoint';

const { colors } = primitives;

const background = {
  default: colors.neutral.white,
  disabled: colors.neutral['100'],
} as const;

const focus = {
  visible: colors.neutral['900'],
  visibleInverted: colors.neutral.white,
} as const;

const hover = {
  overlay: 'rgba(0, 0, 0, 0.0300)',
  overlayContrast: 'rgba(255, 255, 255, 0.1000)',
} as const;

const states = {
  default: brand.blue.main,
  hover: brand.blue.mainDarker,
  focus: brand.blue.main,
  active: brand.blue.mainLight,
  disabled: colors.neutral['300'],
  error: colors.red['300'],

  // Figma's link-visited (mainLight, #5f93c6) is only 3.24:1 against white,
  // failing WCAG AA (4.5:1) — uses the darkest blue stop instead to clear it.
  visited: brand.blue.mainExtraDark,
} as const;

// Figma's Input-states collection (distinct from Primary-states/`states`
// above) — borders are neutral at rest, borrowing brand blue only on hover/focus.
const inputStates = { default: colors.neutral['600'] } as const;

const selectionStates = {
  unchecked: {
    hover: colors.neutral['500'],
    focus: colors.neutral['500'],
    active: colors.neutral['400'],
  },
} as const;

const font = { letterSpacing: rem(0) } as const;

const text = {
  primary: colors.neutral['800'],
  secondary: colors.neutral['600'],
  disabled: colors.neutral['500'],
  header: colors.neutral['900'],
  primaryHeader: brand.blue.mainDark,
} as const;

const highlight = { fontWeight: '700', backgroundColor: 'transparent' } as const;

// `sharp` = system default; `rounded` (9999) clips any control to a pill.
// Literal, not rem() — a pill radius doesn't scale.
const cornerRadius = { sharp: rem(0), rounded: '9999px' } as const;

// Single source for Chip's label line-height so `label.lineHeight` and
// `height`'s calc can't desync.
const chipLineHeightPercent = 150;

const strokeWeight = rem('2px');

const dropShadow = 'rgba(0, 0, 0, 0.5000)';
// Figma's Card/Accordion shadow spec, shared so the two can't drift apart.
const dropShadowTile = `0px 1px 4px 0px ${dropShadow}`;

const focusRing = {
  outline: `${strokeWeight} solid ${focus.visible}`,
  outlineOffset: `calc(${strokeWeight} / 2)`,
} as const;
const focusRingInverted = {
  outline: `${strokeWeight} solid ${focus.visibleInverted}`,
  outlineOffset: `calc(${strokeWeight} / 2)`,
} as const;

const fontFamilyHeader = 'Montserrat Variable, sans-serif';
const fontFamilyBody = 'Open Sans Variable, sans-serif';

// Figma Input line-height + 2×Spacing/Small per breakpoint (#79); every
// button/input renders at this height, borders absorbed via border-box.
const controlHeights = {
  xxl: '52px',
  xl: '52px',
  lg: '52px',
  md: '42px',
  sm: '40px',
  xs: '40px',
} as const satisfies Record<BreakpointKey, string>;

// Day-cell size: 50px from md up, 36px on sm/xs to fit a ~320px popover.
// cellGap/headerGap/todayMarkerInset stay fixed — only cell size scales.
const calendarCellSizes = {
  xxl: '50px',
  xl: '50px',
  lg: '50px',
  md: '50px',
  sm: '36px',
  xs: '36px',
} as const satisfies Record<BreakpointKey, string>;

/**
 * Returns the theme tier for a breakpoint. Component tokens live under
 * `.components` (e.g. `getTheme(bp).components.button`) — not a drop-in for
 * the old `getComponents(bp)`.
 */
export function getTheme(bp: BreakpointKey) {
  const bpTokens = breakpoint[bp];
  if (!bpTokens) {
    throw new Error(
      `getTheme: invalid breakpoint key "${bp}". Expected one of: ${Object.keys(breakpoint).join(', ')}.`
    );
  }
  const components = {
    controlHeight: rem(controlHeights[bp]),
    breadcrumbs: { activePageFontWeight: '600' },
    typography: {
      margin: rem(0),
      h1: {
        fontSize: bpTokens.typography.size.h1,
        fontFamily: fontFamilyHeader,
        fontWeight: '900',
        lineHeight: '130%',
      },
      h2: {
        fontSize: bpTokens.typography.size.h2,
        fontFamily: fontFamilyHeader,
        fontWeight: '900',
        lineHeight: '140%',
      },
      h3: {
        fontSize: bpTokens.typography.size.h3,
        fontFamily: fontFamilyHeader,
        fontWeight: '800',
        lineHeight: '150%',
      },
      h4: {
        fontSize: bpTokens.typography.size.h4,
        fontFamily: fontFamilyHeader,
        fontWeight: '800',
        lineHeight: '150%',
      },
      h5: {
        fontSize: bpTokens.typography.size.h5,
        fontFamily: fontFamilyHeader,
        fontWeight: '600',
        lineHeight: '150%',
      },
      subheader: {
        fontSize: bpTokens.typography.size.subheader,
        fontFamily: fontFamilyBody,
        fontWeight: '600',
        lineHeight: '150%',
      },
      p1: {
        fontSize: bpTokens.typography.size.p1,
        fontFamily: fontFamilyBody,
        fontWeight: '400',
        lineHeight: '150%',
      },
      p2: {
        fontSize: bpTokens.typography.size.p2,
        fontFamily: fontFamilyBody,
        fontWeight: '400',
        lineHeight: '150%',
      },
      caption: {
        fontSize: bpTokens.typography.size.caption,
        fontFamily: fontFamilyBody,
        fontWeight: '400',
        lineHeight: '150%',
      },
    },
    textField: { labelMargin: rem('0px'), minHeight: rem('52px') },
    searchField: { maxWidth: rem('500px'), dropDownMaxHeight: rem('250px') },
    select: { dropDownMaxHeight: rem('350px') },
    pagination: { itemWidth: rem('40px'), itemHeight: rem('40px') },
    accordion: {
      spacing: bpTokens.spacing.xs,
      padding: { horizontal: bpTokens.spacing.md, vertical: bpTokens.spacing.xs },
    },
    appHeader: {
      spacing: bpTokens.spacing.sm,
      padding: { horizontal: bpTokens.layout.margin, vertical: bpTokens.spacing.sm },
    },
    footer: {
      spacing: primitives.spacing['4'],
      padding: {
        horizontal: primitives.spacing['4'],
        verticalBottom: primitives.spacing['2'],
        verticalTop: primitives.spacing['8'],
      },
      backgroundBottom: brand.blue.mainDark,
      backgroundTop: brand.blue.main,
      columnMinWidth: bpTokens.footer.navigationMinWidth,
    },
    button: {
      fontSize: bpTokens.typography.size.p2,
      // Borrows Subheader's Semi-Bold weight (not P2's Regular) — its own
      // token, not a reference, so a Subheader change can't restyle every button.
      fontWeight: '600',
      lineHeight: bpTokens.components.button.lineHeight,
      spacing: bpTokens.spacing.xs,
      // Figma splits these: spacing/medium horizontal, spacing/small vertical.
      padding: { horizontal: bpTokens.spacing.md, vertical: bpTokens.spacing.sm },
    },
    card: {
      textContentSpacing: primitives.spacing['1'],
      // Gap between the text-content block and the actions slot (spacing/medium).
      spacing: bpTokens.spacing.md,
      // Photos' conventional crop ratio, used for `top`-placement media.
      mediaAspectRatio: '3 / 2',
      // `left`-placement media/content column split.
      mediaSplit: '50%',
    },
    paper: {
      // Figma's Card padding scale (spacing/medium, xl, 2xl) — responsive
      // like every other bpTokens.spacing consumer.
      padding: {
        small: bpTokens.spacing.md,
        medium: bpTokens.spacing.xl,
        large: bpTokens.spacing.xxl,
      },
      // Card color overrides, confirmed by pixel-sampling real instances
      // (Figma's codegen only reports default bindings). Only these three
      // have a real example backing the shade — no red/yellow/green, to
      // avoid guessing an untested shade.
      background: {
        turquoise: colors.turquoise['300'],
        blue: colors.blue['500'],
        pink: colors.pink['200'],
      },
    },
    chip: {
      // Figma spacing/2-extra-small, confirmed against the Breakpoints
      // reference frame (5870:41586) — not spacing/extra-small, which a
      // stale example elsewhere incorrectly matched this to before.
      spacing: bpTokens.spacing.xxs,
      cornerRadius: rem('20px'),
      // Caption's size/family/line-height, but Subheader's Semi-Bold weight
      // instead of Caption's own Regular.
      label: {
        fontFamily: fontFamilyBody,
        fontSize: bpTokens.typography.size.caption,
        fontWeight: '600',
        lineHeight: `${chipLineHeightPercent}%`,
      },
      // Vertical padding is fixed (spacing/0,5 = 4px) unlike horizontal below;
      // combined with label's responsive Caption size, gives 32px total
      // height at lg/xl/xxl and shrinks with Caption on narrower breakpoints.
      padding: { horizontal: bpTokens.spacing.sm, vertical: primitives.spacing['0,5'] },
      // 2×vertical padding + label line-height; computed here since
      // Mantine's Chip has no vertical-padding concept, feeding both the
      // filter and removable-tag roles the same height.
      height: `calc(${primitives.spacing['0,5']} * 2 + ${bpTokens.typography.size.caption} * ${chipLineHeightPercent / 100})`,
      // Figma's Neutral/100 tag fill — kept distinct from `background.disabled`
      // even though the value matches, since that token means something
      // semantically different (see the TextLink review lesson).
      tagFill: colors.neutral['100'],
      // Fixed like padding.vertical — Figma's Chip icon is a literal
      // 18×18px square at every breakpoint.
      iconSize: rem('18px'),
    },
    datePicker: {
      todayMarker: colors.neutral['800'],
      // Contrast variant for a today cell that's also selected (blue background).
      todayMarkerContrast: colors.neutral.white,
      // Outer dropdown padding and header/grid/footer gap — Spacing/Medium.
      padding: bpTokens.spacing.md,
      cellSize: rem(calendarCellSizes[bp]),
      cellGap: primitives.spacing['0,5'],
      headerGap: primitives.spacing['1,5'],
      todayMarkerInset: primitives.spacing['0,5'],
    },
    forms: { spacing: primitives.spacing['3'], fieldset: { spacing: primitives.spacing['1'] } },
    icon: {
      size: {
        extraSmall: rem('16px'),
        small: rem('18px'),
        medium: rem('20px'),
        large: rem('24px'),
        extraLarge: rem('28px'),
      },
    },
    iconButton: {
      padding: rem('2px'),
      // Unused by IconButton/LabeledIconButton — those correctly use the
      // top-level cornerRadius.sharp (0px). Don't wire this in without
      // re-checking Figma.
      cornerRadius: rem('4px'),
      minTouchTarget: rem('24px'),
      states: {
        contrast: {
          default: colors.neutral.white,
          hover: colors.neutral['100'],
          focus: colors.neutral['100'],
          active: colors.neutral['200'],
          disabled: colors.neutral['400'],
          overlay: hover.overlayContrast,
        },
        default: colors.neutral['700'],
        hover: colors.neutral['500'],
        focus: colors.neutral['500'],
        active: colors.neutral['400'],
        disabled: colors.neutral['400'],
        // Figma Background/Hover|Focus|Active = neutral['50'] — not
        // neutral.warm['100'] (that belongs to Select's selected-item highlight).
        overlay: colors.neutral['50'],
      },
    },
    labeledIconButton: {
      // Figma Spacing/1 = 8, fixed (not per-breakpoint) — same as forms.fieldset.spacing.
      spacing: primitives.spacing['1'],
    },
    input: {
      font: {
        helperText: {
          fontSize: bpTokens.typography.size.p2,
          lineHeight: bpTokens.components.input.lineHeight,
        },
        // Matches the input text's own line-height token, not a fixed value.
        label: {
          fontSize: bpTokens.typography.size.p2,
          lineHeight: bpTokens.components.input.lineHeight,
        },
        text: {
          fontSize: bpTokens.typography.size.p2,
          lineHeight: bpTokens.components.input.lineHeight,
        },
      },
      padding: { horizontal: bpTokens.spacing.sm, vertical: bpTokens.spacing.sm },
      stroke: { weight: { default: strokeWeight, focus: rem('3px') } },
      spacing: { verticalSpacing: bpTokens.spacing.xxs, horizontalSpacing: bpTokens.spacing.xxs },
    },
    item: {
      highlightFontWeight: '600',
      background: {
        default: colors.neutral.white,
        hover: colors.neutral['50'],
        focus: colors.neutral['50'],
        selected: {
          default: colors.neutral.warm['100'],
          hover: colors.neutral.warm['100'],
          focus: colors.neutral.warm['100'],
        },
        disabled: colors.neutral['50'],
      },
    },
    link: {
      spacing: bpTokens.spacing.xxs,
      // em-based, not breakpoint-driven — TextLink's `size` spans the full
      // type scale, so the gap must scale with size, not just bp.
      iconSpacing: '0.25em',
      // Same reasoning — em-based to scale with `size`. iconVerticalOffset
      // nudges it up to balance against the underline.
      iconSize: '1em',
      iconVerticalOffset: '-0.2em',
      // em-based, set explicitly rather than the browser default — auto
      // thickness looked heavier on bold h1-h5 than p1/p2/caption, burying
      // the hover/focus increase. Fixing it keeps that increase consistent.
      underlineThickness: '0.1em',
      hoverUnderlineThickness: '0.125em',
    },
    list: {
      fontSize: bpTokens.typography.size.p1,
      lineHeight: bpTokens.components.list.lineHeight,
      padding: { horizontal: bpTokens.spacing.md, vertical: bpTokens.spacing.xs },
      spacing: bpTokens.spacing.lg,
      hilightStroke: { default: rem('2px'), selected: rem('8px') },
      header: { strokeWeight: rem('3px') },
    },
    loadingIndicator: {
      indicator: brand.blue.mainLight,
      background: colors.neutral['200'],
      thickness: rem('4px'),
    },
    mainMenu: { spacing: primitives.spacing['4'] },
    menuItem: { padding: { horizontal: bpTokens.spacing.md, vertical: bpTokens.spacing.xs } },
    switch: { height: rem('24px'), backgroundUnchecked: colors.neutral['200'] },
    tabs: {
      label: { fontWeight: { default: '400', selected: '600' } },
      indicator: { thickness: rem('6px') },
      rule: { thickness: rem('2px'), color: colors.neutral['600'] },
      text: {
        default: text.secondary,
        selected: states.default,
      },
      scrollButton: { spacing: bpTokens.spacing.xs },
    },
  };

  return {
    background,
    contrast: colors.neutral.white,
    error: colors.red['300'],
    focus,
    hover,
    divider: colors.neutral['200'],
    cornerRadius,
    strokeWeight,
    dropShadow,
    dropShadowTile,
    states,
    inputStates,
    selectionStates,
    text,
    font,
    highlight,
    focusRing,
    focusRingInverted,
    components,
  };
}

export type Theme = ReturnType<typeof getTheme>;
