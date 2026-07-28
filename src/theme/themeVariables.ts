import { rem } from '@mantine/core';
import { fontFamilyBody, fontFamilyHeader } from './themeVariables/fontFamily';
import { spacingPrimitives, spacing } from './themeVariables/spacing';
import { colors } from './themeVariables/colors';
import { font, text, highlight, typography } from './themeVariables/typography';
import { core } from './themeVariables/core';
import { focusRing, focusRingInverted } from './themeVariables/focus';
import { controlHeights } from './themeVariables/controlHeights';
import { Breakpoints } from './themeVariables/breakpoints';

export const breakpoints = {
  xxl: {
    appWidth: '1920px',
    layout: {
      columns: '12',
      gutter: rem('32px'),
      margin: rem('32px'),
    },
    appHeader: {
      logo: {
        primaryLogoHeight: rem('36px'),
        secondaryLogoHeight: rem('32px'),
      },
      search: {
        maxWidth: rem('320px'),
      },
    },
    components: {
      button: {
        lineHeight: rem('20px'),
      },
      input: {
        lineHeight: rem('20px'),
      },
      list: {
        lineHeight: rem('24px'),
      },
    },
    footer: {
      navigationMinWidth: rem('768px'),
    },
  },
  xl: {
    appWidth: '1440px',
    layout: {
      columns: '12',
      gutter: rem('32px'),
      margin: rem('32px'),
    },
    appHeader: {
      logo: {
        primaryLogoHeight: rem('34px'),
        secondaryLogoHeight: rem('32px'),
      },
      search: {
        maxWidth: rem('320px'),
      },
    },
    components: {
      button: {
        lineHeight: rem('20px'),
      },
      input: {
        lineHeight: rem('20px'),
      },
      list: {
        lineHeight: rem('24px'),
      },
    },
    footer: {
      navigationMinWidth: rem('768px'),
    },
  },
  lg: {
    appWidth: '1024px',
    layout: {
      columns: '12',
      gutter: rem('24px'),
      margin: rem('24px'),
    },
    appHeader: {
      logo: {
        primaryLogoHeight: rem('32px'),
        secondaryLogoHeight: rem('28px'),
      },
      search: {
        maxWidth: rem('9999px'),
      },
    },
    components: {
      button: {
        lineHeight: rem('20px'),
      },
      input: {
        lineHeight: rem('20px'),
      },
      list: {
        lineHeight: rem('24px'),
      },
    },
    footer: {
      navigationMinWidth: rem('680px'),
    },
  },
  md: {
    appWidth: '768px',
    layout: {
      columns: '8',
      gutter: rem('16px'),
      margin: rem('24px'),
    },
    appHeader: {
      logo: {
        primaryLogoHeight: rem('28px'),
        secondaryLogoHeight: rem('24px'),
      },
      search: {
        maxWidth: rem('9999px'),
      },
    },
    components: {
      button: {
        lineHeight: rem('18px'),
      },
      input: {
        lineHeight: rem('18px'),
      },
      list: {
        lineHeight: rem('24px'),
      },
    },
    footer: {
      navigationMinWidth: rem('550px'),
    },
  },
  sm: {
    appWidth: '480px',
    layout: {
      columns: '4',
      gutter: rem('12px'),
      margin: rem('16px'),
    },
    appHeader: {
      logo: {
        primaryLogoHeight: rem('24px'),
        secondaryLogoHeight: rem('20px'),
      },
      search: {
        maxWidth: rem('9999px'),
      },
    },
    components: {
      button: {
        lineHeight: rem('16px'),
      },
      input: {
        lineHeight: rem('16px'),
      },
      list: {
        lineHeight: rem('24px'),
      },
    },
    footer: {
      navigationMinWidth: rem('300px'),
    },
  },
  xs: {
    appWidth: '320px',
    layout: {
      columns: '4',
      gutter: rem('8px'),
      margin: rem('12px'),
    },
    appHeader: {
      logo: {
        primaryLogoHeight: rem('24px'),
        secondaryLogoHeight: rem('20px'),
      },
      search: {
        maxWidth: rem('9999px'),
      },
    },
    components: {
      button: {
        lineHeight: rem('16px'),
      },
      input: {
        lineHeight: rem('16px'),
      },
      list: {
        lineHeight: rem('24px'),
      },
    },
    footer: {
      navigationMinWidth: rem('280px'),
    },
  },
} as const;

export function getComponents(bp: Breakpoints) {
  return {
    controlHeight: rem(controlHeights[bp]),
    breadcrumbs: {
      activePageFontWeight: '600',
    },
    typography: {
      margin: rem(0),
      h1: {
        fontSize: typography[bp].size.h1,
        fontFamily: fontFamilyHeader,
        fontWeight: '900',
        lineHeight: '130%',
      },
      h2: {
        fontSize: typography[bp].size.h2,
        fontFamily: fontFamilyHeader,
        fontWeight: '900',
        lineHeight: '140%',
      },
      h3: {
        fontSize: typography[bp].size.h3,
        fontFamily: fontFamilyHeader,
        fontWeight: '800',
        lineHeight: '150%',
      },
      h4: {
        fontSize: typography[bp].size.h4,
        fontFamily: fontFamilyHeader,
        fontWeight: '800',
        lineHeight: '150%',
      },
      h5: {
        fontSize: typography[bp].size.h5,
        fontFamily: fontFamilyHeader,
        fontWeight: '600',
        lineHeight: '150%',
      },
      subheader: {
        fontSize: typography[bp].size.subheader,
        fontFamily: fontFamilyBody,
        fontWeight: '600',
        lineHeight: '150%',
      },
      p1: {
        fontSize: typography[bp].size.p1,
        fontFamily: fontFamilyBody,
        fontWeight: '400',
        lineHeight: '150%',
      },
      p2: {
        fontSize: typography[bp].size.p2,
        fontFamily: fontFamilyBody,
        fontWeight: '400',
        lineHeight: '150%',
      },
      caption: {
        fontSize: typography[bp].size.caption,
        fontFamily: fontFamilyBody,
        fontWeight: '400',
        lineHeight: '150%',
      },
    },
    textField: {
      labelMargin: rem('0px'),
      minHeight: rem('52px'),
    },
    searchField: {
      maxWidth: rem('500px'),
      dropDownMaxHeight: rem('250px'),
    },
    pagination: {
      itemWidth: rem('40px'),
      itemHeight: rem('40px'),
    },
    accordion: {
      spacing: spacing[bp].xs,
      padding: {
        horizontal: spacing[bp].md,
        vertical: spacing[bp].xs,
      },
    },
    appHeader: {
      spacing: spacing[bp].sm,
      padding: {
        horizontal: breakpoints[bp].layout.margin,
        vertical: spacing[bp].sm,
      },
    },
    footer: {
      spacing: spacingPrimitives['4'],
      padding: {
        horizontal: spacingPrimitives['4'],
        verticalBottom: spacingPrimitives['2'],
        verticalTop: spacingPrimitives['8'],
      },
      backgroundBottom: core.mainDark,
      backgroundTop: core.main,
      columnMinWidth: breakpoints[bp].footer.navigationMinWidth,
    },
    button: {
      fontSize: typography[bp].size.p2,
      lineHeight: breakpoints[bp].components.button.lineHeight,
      spacing: spacing[bp].xs,
      padding: {
        horizontal: spacing[bp].sm,
        vertical: spacing[bp].sm,
      },
    },
    card: {
      padding: spacing[bp].sm,
      spacing: spacing[bp].sm,
      textContentSpacing: spacingPrimitives['1'],
    },
    chip: {
      spacing: spacing[bp].xs,
      cornerRadius: rem('20px'),
      font: {
        lineHeight: breakpoints[bp].components.input.lineHeight,
        size: typography[bp].size.p2,
      },
      padding: {
        horizontal: spacing[bp].sm,
        vertical: spacing[bp].xs,
      },
    },
    datePicker: {
      todayMarker: colors.neutral['800'],
    },
    forms: {
      spacing: spacingPrimitives['3'],
      fieldset: {
        spacing: spacingPrimitives['1'],
      },
    },
    icon: {
      size: {
        extraSmall: rem('12px'),
        small: rem('16px'),
        medium: rem('20px'),
        large: rem('24px'),
        extraLarge: rem('28px'),
      },
    },
    iconButton: {
      padding: rem('2px'),
      cornerRadius: rem('4px'),
      states: {
        contrast: {
          default: colors.neutral.white,
          hover: colors.neutral['100'],
          focus: colors.neutral['100'],
          active: colors.neutral['200'],
          disabled: colors.neutral['300'],
          overlay: 'rgba(255, 255, 255, 0.1000)',
        },
        default: colors.neutral['700'],
        hover: colors.neutral['500'],
        focus: colors.neutral['500'],
        active: colors.neutral['400'],
        disabled: colors.neutral['400'],
        overlay: colors.neutral.warm['100'],
      },
    },
    input: {
      font: {
        helperText: {
          fontSize: typography[bp].size.p2,
          lineHeight: breakpoints[bp].components.input.lineHeight,
        },
        label: {
          fontSize: typography[bp].size.p2,
          lineHeight: rem('24px'),
        },
        text: {
          fontSize: typography[bp].size.p2,
          lineHeight: breakpoints[bp].components.input.lineHeight,
        },
      },
      padding: {
        horizontal: spacing[bp].sm,
        vertical: spacing[bp].sm,
      },
      stroke: {
        weight: {
          default: core.strokeWeight,
          focus: rem('3px'),
        },
      },
      spacing: {
        verticalSpacing: spacing[bp].xxs,
        horizontalSpacing: spacing[bp].xxs,
      },
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
      spacing: spacing[bp].xxs,
    },
    list: {
      fontSize: typography[bp].size.p1,
      lineHeight: breakpoints[bp].components.list.lineHeight,
      padding: {
        horizontal: spacing[bp].md,
        vertical: spacing[bp].xs,
      },
      spacing: spacing[bp].lg,
      highlightStroke: {
        default: rem('2px'),
        selected: rem('8px'),
      },
      header: {
        strokeWeight: rem('3px'),
      },
    },
    loadingIndicator: {
      indicator: core.mainLight,
      background: colors.neutral['200'],
      thickness: rem('4px'),
    },
    mainMenu: {
      spacing: spacingPrimitives['4'],
    },
    menuItem: {
      padding: {
        horizontal: spacing[bp].md,
        vertical: spacing[bp].xs,
      },
    },
    switch: {
      height: rem('24px'),
      backgroundUnchecked: colors.neutral[200],
    },
  };
}

export const themeVariables = {
  focusRing,
  focusRingInverted,
  colors,
  spacing: spacingPrimitives,
  components: getComponents('md'),
  core,
  font,
  text,
  highlight,
  //breakpoints,
} as const;

export type ThemeVariables = typeof themeVariables;
