import { styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

type TypographyKeys = Exclude<keyof typeof vars.theme.components.typography, 'margin'>;
type HeaderKeys = Exclude<TypographyKeys, 'subheader' | 'p1' | 'p2' | 'caption'>;
type ParagraphKeys = Exclude<TypographyKeys, HeaderKeys>;

const textColorMap = {
  caption: vars.theme.text.secondary,
  p2: vars.theme.text.secondary,
  p1: vars.theme.text.primary,
  subheader: vars.theme.text.header,
  h1: vars.theme.text.primaryHeader,
  h2: vars.theme.text.header,
  h3: vars.theme.text.header,
  h4: vars.theme.text.header,
  h5: vars.theme.text.header,
};

function getHeaderStyleObject(variant: HeaderKeys) {
  return {
    margin: vars.theme.components.typography.margin,
    fontFamily: vars.theme.components.typography[variant].fontFamily,
    fontSize: vars.theme.components.typography[variant].fontSize,
    fontWeight: vars.theme.components.typography[variant].fontWeight,
    lineHeight: vars.theme.components.typography[variant].lineHeight,
    color: textColorMap[variant],
  };
}

function getParagraphStyleObject(variant: ParagraphKeys) {
  return {
    margin: vars.theme.components.typography.margin,
    fontFamily: vars.theme.components.typography[variant].fontFamily,
    fontSize: vars.theme.components.typography[variant].fontSize,
    fontWeight: vars.theme.components.typography[variant].fontWeight,
    lineHeight: vars.theme.components.typography[variant].lineHeight,
    color: textColorMap[variant],
  };
}

export const typography = styleVariants({
  h1: getHeaderStyleObject('h1'),
  h2: getHeaderStyleObject('h2'),
  h3: getHeaderStyleObject('h3'),
  h4: getHeaderStyleObject('h4'),
  h5: getHeaderStyleObject('h5'),
  subheader: getParagraphStyleObject('subheader'),
  p1: getParagraphStyleObject('p1'),
  p2: getParagraphStyleObject('p2'),
  caption: getParagraphStyleObject('caption'),
});
