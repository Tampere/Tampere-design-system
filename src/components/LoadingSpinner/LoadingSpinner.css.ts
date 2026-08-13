import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    components: { loadingIndicator },
  },
} = vars;

export const LoadingIndicatorStyles = style({
  selectors: {
    '&::after': {
      borderColor: `${loadingIndicator.indicator} ${loadingIndicator.indicator} ${loadingIndicator.indicator} ${loadingIndicator.background}`,
      borderWidth: loadingIndicator.thickness,
    },
  },
});
