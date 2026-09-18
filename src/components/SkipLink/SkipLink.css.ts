import { style } from '@vanilla-extract/css';
import { vars, visuallyHidden } from '../../theme';

const {
  primitives,
  theme: { components, states, contrast, focusRing },
} = vars;

// Visually hidden until focused (Figma node 14151:15397's focused-state spec; issue
// #144 explicitly calls out `display: none` as the common mistake here, since it would
// remove the link from the tab order). Composed from the shared `visuallyHidden` base
// plus a `:focus-visible` override — same generated class, so the override reliably wins
// over the base rule (a `:focus-visible` compound selector is strictly more specific than
// the bare class it refines; no cross-file specificity ordering risk like AppHeader's
// menuButton `!important` case).
export const root = style([
  visuallyHidden,
  {
    background: states.default,
    color: contrast,
    fontSize: components.button.fontSize,
    fontWeight: components.button.fontWeight,
    lineHeight: components.button.lineHeight,
    textDecoration: 'none',
    selectors: {
      '&:focus-visible': {
        position: 'fixed',
        // Raw primitive, not a semantic/component token — nothing else fits without
        // inventing a coupling to AppHeader (whose own padding.vertical happens to
        // equal 16px too, but SkipLink is explicitly designed to work independently
        // of it). Matches Figma's absolute 16px offset.
        top: primitives.spacing['2'],
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'auto',
        height: 'auto',
        padding: `${components.button.padding.vertical} ${components.button.padding.horizontal}`,
        margin: 0,
        overflow: 'visible',
        clip: 'auto',
        whiteSpace: 'nowrap',
        ...focusRing,
      },
    },
  },
]);
