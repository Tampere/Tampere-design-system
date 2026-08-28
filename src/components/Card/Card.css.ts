import { style, styleVariants } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { card, paper },
    contrast,
  },
} = vars;

export const root = style({ display: 'flex', flexDirection: 'column' });

export const rootMediaLeft = style({ flexDirection: 'row' });

export const media = style({ flex: '1 0 0', minWidth: 0, minHeight: 0 });

export const content = style({
  display: 'flex',
  flexDirection: 'column',
  flex: '1 0 0',
  gap: card.spacing,
});

export const contentPaddingVariants = styleVariants({
  large: { padding: paper.padding.large },
  medium: { padding: paper.padding.medium },
  small: { padding: paper.padding.small },
});

export const textBlock = style({
  display: 'flex',
  flexDirection: 'column',
  gap: card.textContentSpacing,
});

// Typography's `h2`/`h3`/`p2` variants set `color` directly on their own class, so a
// parent-level color doesn't inherit through — this needs to win at equal specificity
// against Typography's own class, same technique DateField already uses for the same
// class of problem (see DateField.css.ts's `contrast`-token `!important` overrides).
export const contrastText = style({ color: `${contrast} !important` });
