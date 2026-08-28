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
  // Figma's "text/link-visited" (brand.blue.mainLight, #5f93c6) only reaches
  // 3.24:1 against white — fails WCAG AA (4.5:1) for normal text. Uses the
  // darkest blue brand stop instead, which clears AA with margin to spare.
  visited: brand.blue.mainExtraDark,
} as const;

// Figma's "Input-states" variable collection — distinct from "Primary-states"
// (which `states` above maps to). Form-control borders are neutral at rest;
// they only borrow the brand blue from `states` on hover/focus.
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

const strokeWeight = rem('2px');

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

// Figma `Breakpoint/Input/Line-height + 2 × Breakpoint/Spacing/Small` per breakpoint. See issue #79.
// Every button variant and input renders at this height; borders are absorbed via `box-sizing: border-box`.
const controlHeights = {
  xxl: '52px',
  xl: '52px',
  lg: '52px',
  md: '42px',
  sm: '40px',
  xs: '40px',
} as const satisfies Record<BreakpointKey, string>;

// Calendar day-cell size: 50px from md up, shrinks to 36px on sm/xs to fit a ~320px popover.
// `cellGap`/`headerGap`/`todayMarkerInset` below are fixed across breakpoints — only the cell size itself scales.
const calendarCellSizes = {
  xxl: '50px',
  xl: '50px',
  lg: '50px',
  md: '50px',
  sm: '36px',
  xs: '36px',
} as const satisfies Record<BreakpointKey, string>;

/**
 * Returns the full `theme` tier (semantic + component tokens) for a given breakpoint.
 * Component tokens are nested under `.components` (e.g. `getTheme(bp).components.button`) —
 * this is not a drop-in replacement for the old `getComponents(bp)`, which returned the
 * components object directly one level up.
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
      lineHeight: bpTokens.components.button.lineHeight,
      spacing: bpTokens.spacing.xs,
      padding: { horizontal: bpTokens.spacing.sm, vertical: bpTokens.spacing.sm },
    },
    card: {
      padding: bpTokens.spacing.sm,
      spacing: bpTokens.spacing.sm,
      textContentSpacing: primitives.spacing['1'],
    },
    chip: {
      spacing: bpTokens.spacing.xs,
      cornerRadius: rem('20px'),
      font: { lineHeight: bpTokens.components.input.lineHeight, size: bpTokens.typography.size.p2 },
      padding: { horizontal: bpTokens.spacing.sm, vertical: bpTokens.spacing.xs },
    },
    datePicker: {
      todayMarker: colors.neutral['800'],
      // Contrast variant for a today cell that's also selected (blue background) —
      // Figma's Components/Date-picker/Today-marker-contrast.
      todayMarkerContrast: colors.neutral.white,
      // Outer dropdown padding and the gap between header/grid/footer — Figma
      // `Spacing/Medium`, which scales 24→16 across breakpoints.
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
      // Unused by IconButton/LabeledIconButton's interactive-state backgrounds —
      // those correctly use the top-level 0px cornerRadius (verified against
      // Figma's Effects/Corner-radius/Default = 0 for this component family).
      // Do not wire this in without re-checking Figma.
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
        // Figma Background/Hover|Focus|Active = #f7f7f9 = colors.neutral['50'].
        // (colors.neutral.warm['100'] = #f1eeeb was the wrong token here — that
        // warm tint belongs to the Select "selected item" highlight instead.)
        overlay: colors.neutral['50'],
      },
    },
    labeledIconButton: {
      // Figma Spacing/1 = 8, a fixed constant (not per-breakpoint) — same
      // precedent as forms.fieldset.spacing above.
      spacing: primitives.spacing['1'],
    },
    input: {
      font: {
        helperText: {
          fontSize: bpTokens.typography.size.p2,
          lineHeight: bpTokens.components.input.lineHeight,
        },
        // Figma uses the same Components/Input/Line-height token for the label as
        // for the input text itself — match it instead of a fixed value.
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
      // em-based (not breakpoint-driven, unlike `spacing` above) because
      // TextLink's `size` spans the full Typography scale (h1…caption), so
      // the icon gap must scale with whatever size is in use, not just bp.
      iconSpacing: '0.25em',
      // Same reasoning: em-based so the icon scales with `size` like the text
      // around it. `iconVerticalOffset` nudges it up to visually balance
      // against the underline (see the usage site for why).
      iconSize: '1em',
      iconVerticalOffset: '-0.2em',
      // Same reasoning as iconSpacing: em-based, and set explicitly rather
      // than left at the browser's auto/from-font default — empirically,
      // the auto thickness appeared heavier on the bold h1…h5 weights than
      // on p1/p2/caption, which made the hover/focus increase below barely
      // register. Fixing the rest-state thickness keeps the hover/focus
      // increase visually consistent across every size and weight in the
      // scale.
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
  };

  return {
    background,
    contrast: colors.neutral.white,
    error: colors.red['300'],
    focus,
    hover,
    divider: colors.neutral['200'],
    cornerRadius: rem(0),
    strokeWeight,
    dropShadow: 'rgba(0, 0, 0, 0.5000)',
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
