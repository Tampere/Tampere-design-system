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

// Figma's Effects/Divider — shared by the semantic `divider` token below and
// by components (e.g. dropzone) whose border is specified against that same
// effect, so the two can't drift apart by editing only one of them.
const divider = colors.neutral['200'];

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

// The kit's minimum touch target (WCAG 2.5.8-style floor), breakpoint-independent
// unlike `bpTokens` below — a component sizes to content by default and opts into
// this only where content alone would fall under it (e.g. AppHeader's small-text
// language links; `components.iconButton.minTouchTarget` is the pre-existing
// component-scoped equivalent for a different control family).
const minTouchTarget = rem('24px');

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
      logo: {
        primaryHeight: bpTokens.appHeader.logo.primaryLogoHeight,
        secondaryHeight: bpTokens.appHeader.logo.secondaryLogoHeight,
      },
      // Single-row's First/Left/Right section gap in Figma (nodes 14147:8543,
      // 14147:10912, 14147:10973) is the grid's own layout/gutter — 32/24/16
      // across xl/lg/md — not appHeader.spacing. Multi-row's rows don't use
      // this; keep it separate so appHeader.spacing stays untouched.
      rowGap: bpTokens.layout.gutter,
      language: {
        // Figma's selected language link (node 4250:40872, "FI") is a local
        // Bold override on top of its own P2/400 base style — a literal
        // Open Sans Bold face, not the 600 Semi-Bold used elsewhere (p1,
        // button, chip), so it gets its own token rather than reusing theirs.
        selectedFontWeight: '700',
      },
      siteName: {
        // Optical correction against the subheader type style's own
        // line-height box — same technique as navigationLink.icon's own
        // verticalOffset below, tuned separately per Figma's visual spec
        // rather than derived from it.
        verticalOffset: '-2px',
      },
    },
    // The popover menu (Figma node 14187:18169, "Main menu"): a fixed,
    // non-responsive box, unlike appHeader's own per-breakpoint padding —
    // Figma gives it one width and one section padding at every breakpoint
    // where it appears (below the breakpoint where the trigger disappears).
    appHeaderMenu: {
      width: rem('284px'),
      sectionPadding: {
        horizontal: primitives.spacing['3'],
        vertical: primitives.spacing['1,5'],
      },
    },
    footer: {
      // Figma's footer auto-layout (Implement-Footer node 5870:41782) spaces every
      // row with the shared per-breakpoint scales, so these follow them too.
      spacing: bpTokens.spacing.lg,
      padding: {
        horizontal: bpTokens.layout.margin,
        verticalTop: bpTokens.spacing.xxl,
        verticalBottom: bpTokens.spacing.md,
        verticalDense: bpTokens.spacing.sm,
      },
      columnGap: bpTokens.layout.gutter,
      brandRowGap: bpTokens.spacing.md,
      bottomBar: { columnGap: bpTokens.spacing.lg, rowGap: bpTokens.spacing.md },
      legalLinks: { columnGap: bpTokens.spacing.md, rowGap: bpTokens.spacing.xs },
      socialLinksGap: bpTokens.spacing.md,
      backgroundBottom: brand.blue.mainDark,
      backgroundTop: brand.blue.main,
      contentMaxWidth: breakpoint.xxl.appWidth,
      columnMinWidth: rem('250px'),
      columnItemGap: bpTokens.spacing.sm,
      // The legal-links row's minimum, not a column minimum: Figma's links row is
      // exactly this wide at 1920 and 1024.
      navigationMinWidth: bpTokens.footer.navigationMinWidth,
      coatOfArmsHeight: bpTokens.appHeader.logo.secondaryLogoHeight,
      wordmark: {
        boxMinWidth: rem('348px'),
        boxMaxWidth: rem('555px'),
        inset: primitives.spacing['8'],
        maxWidth: rem('350px'),
      },
      socialLinksMinWidth: rem('248px'),
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
    badge: {
      background: {
        // Deliberately not `chip.tagFill` — Figma binds Badge's default to the warm swatch.
        neutral: colors.neutral.warm['100'],
        neutralInverted: colors.neutral.warm['700'],
        info: colors.blue['400'],
        success: colors.green['600'],
        warning: colors.yellow['200'],
        error: colors.red['300'],
      },
      padding: { horizontal: bpTokens.spacing.sm },
      spacing: bpTokens.spacing.xxs,
      iconSize: rem('18px'),
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
    dropzone: {
      // Figma: File drop zone, component set 6814:2770. Border is Effects/Divider
      // at Effects/Stroke/Weight/Default; padding is Spacing/2 Extra-large (64px)
      // vertically, Spacing/Medium (24px) horizontally.
      border: divider,
      padding: { horizontal: bpTokens.spacing.md, vertical: bpTokens.spacing.xxl },
      // The drop area's own auto-layout gap (heading → picker). Figma binds the
      // raw `Spacing/4` primitive here, so it stays 32px at every breakpoint —
      // deliberately NOT `bpTokens.spacing.lg`, which drops to 24 below 1024.
      spacing: primitives.spacing['4'],
      // Not designed in Figma — derived from existing tokens pending design input.
      // Replace these two with real variables once the drag states are drawn;
      // do not treat them as Figma-backed.
      dragOver: { border: states.hover, background: colors.neutral['50'] },
      dragReject: { border: states.error, title: states.error },
    },
    fileList: {
      // Figma: .File list, 6801:3920 — 48px rows = 24px line-height (reused from
      // components.list.lineHeight) + Spacing/Extra-small (12px) top and bottom.
      // The label's font/line-height are NOT duplicated here: .File list binds the
      // same Components/List variables that components.list already exposes.
      padding: { vertical: bpTokens.spacing.xs },
      // The horizontal gap between a row's filename and its remove button —
      // NOT the gap between rows. Rows correctly have no gap of their own
      // (see FileList.css.ts `list`), matching Figma's flush 48px rows.
      spacing: bpTokens.spacing.sm,
    },
    forms: {
      spacing: primitives.spacing['3'],
      fieldset: {
        // Figma's `Components/Fieldset/Spacing`, aliased through
        // `Breakpoint/Spacing/Small` — 16px at 1024/1440/1920, 12px at
        // 320/480/768.
        spacing: bpTokens.spacing.sm,
        // Figma's `Components/Fieldset/Field-group-spacing`, aliased through
        // `Breakpoint/Spacing/Medium` — 24px at 1024/1440/1920, 16px at
        // 320/480/768. Gap between multiple distinct input elements composed
        // directly inside one Fieldset (e.g. TextField + Select + DateField)
        // — distinct from the tighter Checkbox/Radio item-to-item gap, which
        // lives inside those components and is untouched.
        fieldGroupSpacing: bpTokens.spacing.md,
        // Figma's Fieldset `.Required` instance sits at x=336, right after the
        // `.Input label` ending at x=332 — a fixed 4px gap, not per-breakpoint
        // (same precedent as `labeledIconButton.spacing` below).
        requiredIndicatorGap: primitives.spacing['0,5'],
        // Figma's `Forms/Selection-items-spacing` (gap between Checkbox/Radio
        // items grouped under one Fieldset) aliases through the same
        // `Breakpoint/Spacing/Small` chain as `spacing` above — same values
        // today, but kept as its own token since the two Figma variables are
        // independent and could diverge later.
        selectionItemsSpacing: bpTokens.spacing.sm,
      },
    },
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
      // Figma's label uses the Button/Medium text style: Caption's own
      // size/family/line-height, but Subheader-style Semi-Bold weight rather
      // than Caption's own Regular — same borrowed-weight pattern as
      // `chip.label.fontWeight`, kept as its own token for the same reason.
      label: {
        fontWeight: '600',
      },
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
    navigationLink: {
      icon: {
        // Figma's startIcon/endIcon (node 3992:2329) are a fixed 18×18px
        // square at both the Medium and Small size variants — a literal
        // like Chip's own `iconSize` above, not derived from the generic
        // `icon.size` scale (this codebase's precedent: component-specific
        // icon sizing is its own constant even when the value coincides).
        size: rem('18px'),
        // Figma's Spacing/2-extra-small = 8px, same value on both sides —
        // a fixed constant like labeledIconButton.spacing above, not part
        // of the responsive scale.
        spacing: primitives.spacing['1'],
        // Same technique as `link.iconVerticalOffset` above (can't reference
        // that key directly — it's a sibling in this same object literal):
        // nudges the icon up to visually balance it against the link's
        // underline, the same optical correction TextLink's trailing icon
        // needs — but only half the nudge, tuned separately for this fixed
        // 18px icon rather than TextLink's em-scaled one.
        verticalOffset: '-0.1em',
      },
      // Figma's Medium size (node 3992:2329) reuses Subheader's Semi-Bold weight
      // rather than P1's own Regular — same "borrow a heavier style's weight"
      // pattern as Chip's `chip.label.fontWeight` and Button's `button.fontWeight`,
      // kept as its own token so a future Subheader change can't silently
      // restyle every link. Small size keeps P2's own Regular weight as-is.
      label: {
        mediumFontWeight: '600',
      },
    },
    skipLink: {
      // One above Mantine's "app" elevation (getDefaultZIndex('app') === 100):
      // equal z-index would lose the stacking tie against fixed app-layer chrome
      // (e.g. AppShell.Header), since ties fall back to DOM tree order and the
      // skip link must render first in the document to be the first tab stop.
      // Still below "modal" (200), so it can never paint over a modal. String,
      // not number — every other leaf in this tree is a string (the
      // vanilla-extract CSS-variable contract requires it).
      zIndex: '101',
    },
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
    divider,
    cornerRadius,
    strokeWeight,
    minTouchTarget,
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
