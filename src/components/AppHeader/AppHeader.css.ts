import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { appHeader },
  },
} = vars;

export const navList = style({
  display: 'flex',
  alignItems: 'center',
  gap: appHeader.spacing,
  listStyle: 'none',
  margin: 0,
  padding: 0,
});

export const navItem = style({ display: 'flex' });

// Empty for now — Task 7 adds the @media rule that hides this above 1440px.
export const menuButton = style({});
