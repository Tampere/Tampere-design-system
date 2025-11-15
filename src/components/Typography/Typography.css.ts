import { vars } from '../../theme';
import { styleVariants } from '@vanilla-extract/css';

type TypographyKeys = Exclude<keyof typeof vars.components.typography, 'margin'>;
type HeaderKeys = Exclude<TypographyKeys, 'subheader' | 'p1' | 'p2'>;
type ParagraphKeys = Exclude<TypographyKeys, HeaderKeys>;

const textColorMap = {
  p2: vars.text.secondary,
  p1: vars.text.primary,
  subheader: vars.text.header,
  h1: vars.text.primaryHeader,
  h2: vars.text.header,
  h3: vars.text.header,
  h4: vars.text.header,
  h5: vars.text.header,
};

function getHeaderStyleObject(variant: HeaderKeys) {
  return {
    margin: vars.components.typography.margin,
    fontFamily: vars.components.typography[variant].fontFamily,
    fontSize: vars.components.typography[variant].fontSize,
    fontWeight: vars.components.typography[variant].fontWeight,
    lineHeight: vars.components.typography[variant].lineHeight,
    color: textColorMap[variant],
  };
}

function getParagraphStyleObject(variant: ParagraphKeys) {
  return {
    margin: vars.components.typography.margin,
    fontSize: vars.components.typography[variant].fontSize,
    fontWeight: vars.components.typography[variant].fontWeight,
    lineHeight: vars.components.typography[variant].lineHeight,
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
});
