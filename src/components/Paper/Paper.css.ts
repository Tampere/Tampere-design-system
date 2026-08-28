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
  borderRadius: cornerRadius.sharp,
  border: 'none',
  boxShadow: 'none',
});

export const backgroundVariants = styleVariants({
  default: { backgroundColor: background.default },
  turquoise: { backgroundColor: paper.background.turquoise },
  blue: { backgroundColor: paper.background.blue },
  pink: { backgroundColor: paper.background.pink },
});

// Prop values (`sm`/`md`/`lg`) match the rest of the library's size scale
// convention (IconButton, NavigationLink); the underlying token keys
// (`paper.padding.small/medium/large` in theme.ts) stay as Figma's own names.
export const paddingVariants = styleVariants({
  none: { padding: 0 },
  sm: { padding: paper.padding.small },
  md: { padding: paper.padding.medium },
  lg: { padding: paper.padding.large },
});

export const pill = style({ borderRadius: cornerRadius.rounded });

export const withBorder = style({ borderWidth: strokeWeight, borderStyle: 'solid' });

export const borderColorVariants = styleVariants({
  divider: { borderColor: divider },
  brand: { borderColor: states.default },
});

// Matches the shape Accordion already uses for this same token — confirmed
// against Figma's Card dropshadow spec (offset 0/1, blur 4, spread 0). DateField's
// shadow uses a different, larger shape (its own floating popover surface, not a
// tile) — not a match to compare against.
export const withShadow = style({ boxShadow: `0px 1px 4px 0px ${dropShadow}` });
