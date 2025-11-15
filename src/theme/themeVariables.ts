import { rem } from '@mantine/core';

export const breakpoints = {
  xl: {
    typography: {
      size: {
        h1: rem('40px'),
        h2: rem('36px'),
        h3: rem('32px'),
        h4: rem('28px'),
        h5: rem('24px'),
        subheader: rem('20px'),
        p1: rem('20px'),
        p2: rem('18px'),
      },
    },
    appWidth: '1440px',
    appHeader: {
      logo: {
        primaryLogoHeight: rem('40px'),
        secondaryLogoHeight: rem('30px'),
      },
      search: {
        maxWidth: rem('275px'),
      },
    },
  },
  lg: {
    typography: {
      size: {
        h1: rem('36px'),
        h2: rem('32px'),
        h3: rem('28px'),
        h4: rem('24px'),
        h5: rem('22px'),
        subheader: rem('20px'),
        p1: rem('20px'),
        p2: rem('18px'),
      },
    },
    appWidth: '1024px',
    appHeader: {
      logo: {
        primaryLogoHeight: rem('35px'),
        secondaryLogoHeight: rem('26px'),
      },
      search: {
        maxWidth: rem('9999px'),
      },
    },
  },
  md: {
    typography: {
      size: {
        h1: rem('32px'),
        h2: rem('28px'),
        h3: rem('24px'),
        h4: rem('20px'),
        h5: rem('18px'),
        subheader: rem('18px'),
        p1: rem('18px'),
        p2: rem('16px'),
      },
    },
    appWidth: '768px',
    appHeader: {
      logo: {
        primaryLogoHeight: rem('30px'),
        secondaryLogoHeight: rem('23px'),
      },
      search: {
        maxWidth: rem('9999px'),
      },
    },
  },
  sm: {
    typography: {
      size: {
        h1: rem('28px'),
        h2: rem('24px'),
        h3: rem('20px'),
        h4: rem('18px'),
        h5: rem('16px'),
        subheader: rem('16px'),
        p1: rem('16px'),
        p2: rem('14px'),
      },
    },
    appWidth: '480px',
    appHeader: {
      logo: {
        primaryLogoHeight: rem('25px'),
        secondaryLogoHeight: rem('20px'),
      },
      search: {
        maxWidth: rem('9999px'),
      },
    },
  },
  xs: {
    typography: {
      size: {
        h1: rem('28px'),
        h2: rem('24px'),
        h3: rem('20px'),
        h4: rem('18px'),
        h5: rem('16px'),
        subheader: rem('16px'),
        p1: rem('16px'),
        p2: rem('14px'),
      },
    },
    appWidth: '320px',
    appHeader: {
      logo: {
        primaryLogoHeight: rem('25px'),
        secondaryLogoHeight: rem('20px'),
      },
      search: {
        maxWidth: rem('9999px'),
      },
    },
  },
} as const;

const colors = {
  red: {
    '100': '#eb5e58',
    '200': '#c83e36',
    '300': '#da2321',
    '400': '#ae1e20',
  },

  pink: {
    '50': '#f7e4e9',
    '100': '#cb4a6c',
    '200': '#ad3963',
    '300': '#a5407b',
  },

  yellow: {
    '50': '#f9ecd4',
    '100': '#f8de79',
    '200': '#f4d240',
    '300': '#e8b455',
    '400': '#fdb924',
  },

  blue: {
    '100': '#e5eef8',
    '200': '#88bce7',
    '300': '#5f93c6',
    '400': '#29549a',
    '500': '#22437b',
    '600': '#1d3a6c',
    '700': '#172f5a',
    '800': '#122648',
    '900': '#0d1b36',
  },

  turquoise: {
    '100': '#91c9ea',
    '200': '#39a7d7',
    '300': '#0074a4',
  },

  green: {
    '50': '#eaf1db',
    '100': '#cddeaa',
    '200': '#abc872',
    '300': '#88b068',
    '400': '#64995f',
    '500': '#418155',
    '600': '#386f49',
    '700': '#2f5d3d',
    '800': '#254a31',
    '900': '#1c3825',
  },

  neutral: {
    '50': '#f7f7f9',
    '100': '#f2f2f4',
    '200': '#dedee2',
    '300': '#c9c9ce',
    '400': '#9999a0',
    '500': '#686872',
    '600': '#52525b',
    '700': '#3e3e45',
    '800': '#2d2d32',
    '900': '#1e1e22',

    white: '#ffffff',
    black: '#000000',

    warm: {
      '100': '#f1eeeb',
    },
  },
} as const;

const spacing = {
  '1': rem('8px'),
  '2': rem('16px'),
  '3': rem('24px'),
  '4': rem('32px'),
  '5': rem('40px'),
  '6': rem('48px'),
  '7': rem('56px'),
  '8': rem('64px'),
  '9': rem('72px'),
  '10': rem('80px'),
  '12': rem('96px'),
  '14': rem('112px'),
  '20': rem('160px'),
  '0,5': rem('4px'),
  '1,5': rem('12px'),
} as const;

const core = {
  background: colors.neutral.white,
  backgroundDisabled: colors.neutral['100'],
  contrast: colors.neutral.white,
  error: colors.red['300'],
  mainLight: colors.blue['300'],
  main: colors.blue['400'],
  mainDark: colors.blue['500'],
  mainDarker: colors.blue['600'],
  focus: {
    visible: colors.neutral['900'],
    visibleInverted: colors.neutral.white,
  },
  mainExtraDark: colors.blue['700'],
  hover: {
    overlay: 'rgba(0, 0, 0, 0.0300)',
    overlayContrast: 'rgba(255, 255, 255, 0.0500)',
  },
  divider: colors.neutral['200'],
  cornerRadius: rem(0),
  strokeWeight: rem('2px'),
  dropshadow: colors.neutral['400'],
  states: {
    default: colors.blue['400'],
    hover: colors.blue['600'],
    focus: colors.blue['400'],
    active: colors.blue['300'],
    disabled: colors.neutral['300'],
    error: colors.red['300'],
    visited: colors.blue['300'],
  },
} as const;

const fontFamilyHeader = 'Montserrat, sans-serif';

export function getComponents(bp: keyof typeof breakpoints) {
  return {
    breadcrumbs: {
      activePageFontWeight: '600',
    },
    typography: {
      margin: rem(0),
      h1: {
        fontSize: breakpoints[bp].typography.size.h1,
        fontFamily: fontFamilyHeader,
        fontWeight: '900',
        lineHeight: '130%',
      },
      h2: {
        fontSize: breakpoints[bp].typography.size.h2,
        fontFamily: fontFamilyHeader,
        fontWeight: '900',
        lineHeight: '140%',
      },
      h3: {
        fontSize: breakpoints[bp].typography.size.h3,
        fontFamily: fontFamilyHeader,
        fontWeight: '800',
        lineHeight: '150%',
      },
      h4: {
        fontSize: breakpoints[bp].typography.size.h4,
        fontFamily: fontFamilyHeader,
        fontWeight: '800',
        lineHeight: '150%',
      },
      h5: {
        fontSize: breakpoints[bp].typography.size.h5,
        fontFamily: fontFamilyHeader,
        fontWeight: '600',
        lineHeight: '150%',
      },
      subheader: {
        fontSize: breakpoints[bp].typography.size.subheader,
        fontWeight: '600',
        lineHeight: '150%',
      },
      p1: {
        fontSize: breakpoints[bp].typography.size.p1,
        fontWeight: '400',
        lineHeight: '150%',
      },
      p2: {
        fontSize: breakpoints[bp].typography.size.p2,
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
      spacing: spacing['1,5'],
      padding: {
        horizontal: spacing['3'],
        vertical: spacing['1,5'],
      },
    },
    appHeader: {
      spacing: spacing['3'],
      padding: {
        horizontal: spacing['4'],
        vertical: spacing['2'],
      },
    },
    footer: {
      spacing: spacing['4'],
      padding: {
        horizontal: spacing['4'],
        verticalBottom: spacing['2'],
        verticalTop: spacing['8'],
      },
      backgroundBottom: core.mainDark,
      backgroundTop: core.main,
      columnMinWidth: rem('250px'),
    },
    button: {
      fontSize: breakpoints[bp].typography.size.p2,
      lineHeight: rem('20px'),
      spacing: spacing['1,5'],
      padding: {
        horizontal: spacing['2'],
        vertical: spacing['2'],
      },
    },
    card: {
      paddingSmall: spacing['3'],
      paddingMedium: spacing['6'],
      paddingLarge: spacing['8'],
      spacing: spacing['3'],
      textContentSpacing: spacing['1'],
    },
    chip: {
      spacing: spacing['1,5'],
      cornerRadius: rem('20px'),
      font: {
        lineHeight: rem('20px'),
        size: breakpoints[bp].typography.size.p2,
      },
      padding: {
        horizontal: spacing['2'],
        vertical: spacing['1'],
      },
    },
    datePicker: {
      todayMarker: colors.neutral['800'],
    },
    forms: {
      spacing: spacing['3'],
      fieldset: {
        spacing: spacing['1'],
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
          fontSize: breakpoints[bp].typography.size.p2,
          lineHeight: rem('22px'),
        },
        label: {
          fontSize: breakpoints[bp].typography.size.p2,
          lineHeight: rem('24px'),
        },
        text: {
          fontSize: breakpoints[bp].typography.size.p2,
          lineHeight: rem('20px'),
        },
      },
      padding: {
        horizontal: spacing['2'],
        vertical: spacing['2'],
      },
      stroke: {
        weight: {
          default: core.strokeWeight,
          focus: rem('3px'),
        },
      },
      spacing: {
        verticalSpacing: spacing['1'],
        horizontalSpacing: spacing['1,5'],
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
      spacing: spacing['1'],
    },
    list: {
      fontSize: breakpoints[bp].typography.size.p1,
      lineHeight: rem('24px'),
      padding: {
        horizontal: spacing['3'],
        vertical: spacing['1,5'],
      },
      spacing: spacing['4'],
      hilightStroke: {
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
      spacing: spacing['4'],
    },
    menuItem: {
      padding: {
        horizontal: spacing['2'],
        vertical: spacing['1,5'],
      },
    },
    map: {
      backgroundMap: {
        opacity: '0.5',
      },
      buildingLayer: {
        default: {
          fillColor: '#70BEFF',
          fillOpacity: '0.66',
          strokeColor: colors.blue[500],
          strokeWidth: '1',
        },
        hover: {
          fillColor: '#A5407B',
          fillOpacity: '0.8',
          strokeColor: colors.blue[500],
          strokeWidth: '1',
        },
        selected: {
          fillColor: colors.pink[300],
          fillOpacity: '1.0',
          strokeColor: colors.pink[300],
          strokeWidth: '1',
        },
        insideSelection: {
          fillColor: colors.neutral.white,
          fillOpacity: '1.0',
          strokeWidth: '1',
          planned: {
            strokeColor: colors.green[400],
          },
          demolished: {
            strokeColor: colors.red[400],
          },
          building: {
            strokeColor: colors.blue[500],
          },
          structure: {
            strokeColor: colors.turquoise[300],
          },
        },
        planned: {
          fillColor: colors.green[50],
        },
        demolished: {
          fillColor: colors.pink[50],
        },
        building: {
          fillColor: colors.blue[100],
        },
        structure: {
          fillColor: '#E0EFF8',
        },
      },
      propertyLayer: {
        default: {
          fillColor: '#FFFFFF',
          fillOpacity: '0.0',
          strokeColor: colors.turquoise[300],
          strokeWidth: '1',
        },
        hover: {
          fillColor: '#FFDCE5',
          fillOpacity: '0.54',
          strokeColor: colors.turquoise[300],
          strokeWidth: '1',
        },
        selected: {
          fillColor: '#FFDCE5',
          fillOpacity: '0.54',
          strokeColor: colors.pink[200],
          strokeWidth: '2',
        },
      },
    },
    switch: {
      height: rem('24px'),
      backgroundUnchecked: colors.neutral[200],
    },
  };
}

const font = {
  letterSpacing: rem(0),
} as const;

const text = {
  primary: colors.neutral[800],
  secondary: colors.neutral[600],
  disabled: colors.neutral[400],
  header: colors.neutral[900],
  primaryHeader: core.mainDark,
} as const;

const highlight = {
  fontWeight: '700',
  backgroundColor: 'transparent',
};

const focusRing = {
  outline: `${core.strokeWeight} solid ${core.focus.visible}`,
  outlineOffset: `calc(${core.strokeWeight} / 2)`,
};

const focusRingInverted = {
  outline: `${core.strokeWeight} solid ${core.focus.visibleInverted}`,
  outlineOffset: `calc(${core.strokeWeight} / 2)`,
};

export const themeVariables = {
  focusRing,
  focusRingInverted,
  colors,
  spacing,
  components: getComponents('md'),
  core,
  font,
  text,
  highlight,
  breakpoints,
} as const;

export type ThemeVariables = typeof themeVariables;
