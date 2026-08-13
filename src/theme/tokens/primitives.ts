import { rem } from '@mantine/core';

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

const colors = {
  red: {
    '100': '#eb5e58',
    '200': '#c83e36',
    '300': '#ae1e20',
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

export const primitives = { colors, spacing } as const;
export type Primitives = typeof primitives;
