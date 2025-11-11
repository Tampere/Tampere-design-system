import { style } from "@vanilla-extract/css";
import { vars } from "@theme";

const {
  components: { loadingIndicator },
} = vars;

export const loader = style({
  selectors: {
    "&::after": {
      borderColor: `${loadingIndicator.indicator} ${loadingIndicator.indicator} ${loadingIndicator.indicator} ${loadingIndicator.background}`,
      borderWidth: loadingIndicator.thickness,
    },
  },
});
