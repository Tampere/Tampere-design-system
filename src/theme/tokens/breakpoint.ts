import { rem } from '@mantine/core';
import { primitives } from './primitives';

const { spacing } = primitives;

export type BreakpointValues = {
  typography: {
    size: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      subheader: string;
      p1: string;
      p2: string;
      caption: string;
    };
  };
  appWidth: string;
  layout: { columns: string; gutter: string; margin: string };
  appHeader: {
    logo: { primaryLogoHeight: string; secondaryLogoHeight: string };
    search: { maxWidth: string };
  };
  components: {
    button: { lineHeight: string };
    input: { lineHeight: string };
    list: { lineHeight: string };
  };
  spacing: { xxs: string; xs: string; sm: string; md: string; lg: string; xl: string; xxl: string };
  footer: { navigationMinWidth: string };
};

export const breakpoint = {
  xxl: {
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
        caption: rem('16px'),
      },
    },
    appWidth: '1920px',
    layout: { columns: '12', gutter: rem('32px'), margin: rem('32px') },
    appHeader: {
      logo: { primaryLogoHeight: rem('36px'), secondaryLogoHeight: rem('32px') },
      search: { maxWidth: rem('320px') },
    },
    components: {
      button: { lineHeight: rem('20px') },
      input: { lineHeight: rem('20px') },
      list: { lineHeight: rem('24px') },
    },
    spacing: {
      xxs: spacing['1'],
      xs: spacing['1,5'],
      sm: spacing['2'],
      md: spacing['3'],
      lg: spacing['4'],
      xl: spacing['6'],
      xxl: spacing['8'],
    },
    footer: { navigationMinWidth: rem('768px') },
  },
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
        caption: rem('16px'),
      },
    },
    appWidth: '1440px',
    layout: { columns: '12', gutter: rem('32px'), margin: rem('32px') },
    appHeader: {
      logo: { primaryLogoHeight: rem('34px'), secondaryLogoHeight: rem('32px') },
      search: { maxWidth: rem('320px') },
    },
    components: {
      button: { lineHeight: rem('20px') },
      input: { lineHeight: rem('20px') },
      list: { lineHeight: rem('24px') },
    },
    spacing: {
      xxs: spacing['1'],
      xs: spacing['1,5'],
      sm: spacing['2'],
      md: spacing['3'],
      lg: spacing['4'],
      xl: spacing['6'],
      xxl: spacing['8'],
    },
    footer: { navigationMinWidth: rem('768px') },
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
        caption: rem('16px'),
      },
    },
    appWidth: '1024px',
    layout: { columns: '12', gutter: rem('24px'), margin: rem('24px') },
    appHeader: {
      logo: { primaryLogoHeight: rem('32px'), secondaryLogoHeight: rem('28px') },
      search: { maxWidth: rem('9999px') },
    },
    components: {
      button: { lineHeight: rem('20px') },
      input: { lineHeight: rem('20px') },
      list: { lineHeight: rem('24px') },
    },
    spacing: {
      xxs: spacing['1'],
      xs: spacing['1,5'],
      sm: spacing['2'],
      md: spacing['3'],
      lg: spacing['4'],
      xl: spacing['6'],
      xxl: spacing['8'],
    },
    footer: { navigationMinWidth: rem('680px') },
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
        caption: rem('14px'),
      },
    },
    appWidth: '768px',
    layout: { columns: '8', gutter: rem('16px'), margin: rem('24px') },
    appHeader: {
      logo: { primaryLogoHeight: rem('28px'), secondaryLogoHeight: rem('24px') },
      search: { maxWidth: rem('9999px') },
    },
    components: {
      button: { lineHeight: rem('18px') },
      input: { lineHeight: rem('18px') },
      list: { lineHeight: rem('24px') },
    },
    spacing: {
      xxs: spacing['0,5'],
      xs: spacing['1'],
      sm: spacing['1,5'],
      md: spacing['2'],
      lg: spacing['3'],
      xl: spacing['5'],
      xxl: spacing['6'],
    },
    footer: { navigationMinWidth: rem('550px') },
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
        caption: rem('12px'),
      },
    },
    appWidth: '480px',
    layout: { columns: '4', gutter: rem('12px'), margin: rem('16px') },
    appHeader: {
      logo: { primaryLogoHeight: rem('24px'), secondaryLogoHeight: rem('20px') },
      search: { maxWidth: rem('9999px') },
    },
    components: {
      button: { lineHeight: rem('16px') },
      input: { lineHeight: rem('16px') },
      list: { lineHeight: rem('24px') },
    },
    spacing: {
      xxs: spacing['0,5'],
      xs: spacing['1'],
      sm: spacing['1,5'],
      md: spacing['2'],
      lg: spacing['3'],
      xl: spacing['4'],
      xxl: spacing['5'],
    },
    footer: { navigationMinWidth: rem('300px') },
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
        caption: rem('12px'),
      },
    },
    appWidth: '320px',
    layout: { columns: '4', gutter: rem('8px'), margin: rem('12px') },
    appHeader: {
      logo: { primaryLogoHeight: rem('24px'), secondaryLogoHeight: rem('20px') },
      search: { maxWidth: rem('9999px') },
    },
    components: {
      button: { lineHeight: rem('16px') },
      input: { lineHeight: rem('16px') },
      list: { lineHeight: rem('24px') },
    },
    spacing: {
      xxs: spacing['0,5'],
      xs: spacing['1'],
      sm: spacing['1,5'],
      md: spacing['2'],
      lg: spacing['3'],
      xl: spacing['4'],
      xxl: spacing['5'],
    },
    footer: { navigationMinWidth: rem('280px') },
  },
} as const satisfies Record<'xxl' | 'xl' | 'lg' | 'md' | 'sm' | 'xs', BreakpointValues>;

export type Breakpoint = typeof breakpoint;
export type BreakpointKey = keyof Breakpoint;

// Literal (non-responsive) thresholds for `@container` queries in component
// stylesheets. Deliberately separate from the `breakpoint` table above: that
// table's values are consumed through `vars.theme` and swapped via CSS custom
// properties at `:root` for viewport `@media` queries — `@container`
// conditions require an actual literal length, not a `var()` reference, and a
// component's own container-query threshold is that component's layout
// decision, not the site's responsive viewport grid, so it shouldn't drift
// just because the viewport `md` breakpoint is retuned for unrelated reasons.
export const containerQueryBreakpoint = { md: '768px' } as const;

// Sorted explicitly by appWidth — do not rely on object key declaration order.
// That was a prior bug (see commit 58f906c): a reorder/insert in the object
// above must not silently invert this widest-first ordering.
export const BREAKPOINT_KEYS_WIDEST_FIRST = (Object.keys(breakpoint) as BreakpointKey[]).sort(
  (a, b) => parseInt(breakpoint[b].appWidth) - parseInt(breakpoint[a].appWidth)
);
