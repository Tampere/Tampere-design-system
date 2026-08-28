import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { paper },
    background,
    cornerRadius,
    strokeWeight,
    divider,
    dropShadow,
    states,
  },
} = vars;

export const root = style({
  backgroundColor: background.default,
  borderRadius: cornerRadius.sharp,
  border: 'none',
  boxShadow: 'none',
});

export const backgroundVariants = styleVariants({
  default: { backgroundColor: background.default },
  inverted: { backgroundColor: paper.background.inverted },
});

export const paddingVariants = styleVariants({
  small: { padding: paper.padding.small },
  medium: { padding: paper.padding.medium },
  large: { padding: paper.padding.large },
});

export const pill = style({ borderRadius: cornerRadius.rounded });

export const withBorder = style({ borderWidth: strokeWeight, borderStyle: 'solid' });

export const borderColorVariants = styleVariants({
  divider: { borderColor: divider },
  brand: { borderColor: states.default },
});

// Matches the shape Accordion/DateField already use for this same token — confirmed
// against Figma's Card dropshadow spec (offset 0/1, blur 4, spread 0).
export const withShadow = style({ boxShadow: `0px 1px 4px 0px ${dropShadow}` });
