import { forwardRef, useEffect, type ReactNode } from 'react';
import cx from 'clsx';
import { Paper, type PaperProps } from '../Paper';
import { backgroundVariants } from '../Paper/Paper.css';
import { Typography } from '../Typography';
import {
  root,
  rootMediaLeft,
  media as mediaClass,
  content,
  contentPaddingVariants,
  textBlock,
  inverted as invertedMarker,
} from './Card.css';

export interface CardProps extends React.AriaAttributes {
  /** `'lg'` → H2 heading + Paper's `lg` padding. `'md'`/`'sm'` → H3 heading + matching padding. */
  size?: 'lg' | 'md' | 'sm';
  /**
   * A non-`'default'` background inverts Card's own text (Typography/TextLink)
   * to a readable contrast color, but nested components with their own light
   * surface — e.g. `Button`, `Chip` — deliberately keep their own colors (see
   * `Card.css.ts`'s `invertibleSelectors`) rather than being force-inverted.
   * That pairing isn't contrast-checked against colored backgrounds yet, so a
   * `Button` in `children`/`actions` can be unreadable there — keep non-default
   * backgrounds to text-only content until Button gets a contrast-checked
   * inverted variant.
   */
  background?: PaperProps['background'];
  /**
   * Rendered in a fixed 3:2 frame (`top` placement) or a 50/50 column (`left`
   * placement), cropped with `object-fit: cover` so its own aspect ratio never
   * distorts to fit — an `<img>`, `<video>`, `<svg>`, `<iframe>`/`<canvas>`
   * embed, or a wrapped element (e.g. `<picture><img/></picture>`).
   */
  media?: ReactNode;
  /** Ignored when `media` is omitted. Default `'top'`. */
  mediaPlacement?: 'top' | 'left';
  title: string;
  /**
   * Overrides `size`'s default heading level (`lg`→2, `md`/`sm`→3) — e.g. for a
   * Card nested under an existing heading, so it doesn't emit a second H2.
   */
  titleOrder?: 2 | 3 | 4 | 5;
  /** Optional small text above the title. */
  eyebrow?: string;
  /** Optional slot rendered after the body content. */
  actions?: ReactNode;
  /** Body content between the title and `actions` — text, Buttons, other components. */
  children?: ReactNode;
  className?: string;
  id?: string;
  role?: string;
  /** Polymorphic root element, e.g. `component="article"`. */
  component?: React.ElementType;
  'data-testid'?: string;
}

const headingVariant = { lg: 'h2', md: 'h3', sm: 'h3' } as const;
const titleComponent = { 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5' } as const;

/** A static content tile. Not itself a link — nested interactive elements (in `actions`/`children`) stay independently focusable. */
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      size = 'lg',
      background = 'default',
      media,
      mediaPlacement = 'top',
      title,
      titleOrder,
      eyebrow,
      actions,
      children,
      className,
      ...props
    },
    ref
  ) => {
    // Assumes every non-default background is dark enough to need contrast text.
    // Holds for today's three (turquoise/blue/pink) — revisit if `red`/`yellow`/
    // `green` are ever added to `PaperProps['background']` (see Paper.tsx), since
    // a light one would need this to key off a per-background contrast token
    // instead of a blanket `!== 'default'` check.
    //
    // Guarded by membership in `backgroundVariants` (not just `!== 'default'`) so
    // an out-of-union value — which Paper's own guard warns on but still renders
    // with no background color applied — degrades to non-inverted (dark-on-white)
    // text instead of force-inverting to unreadable light-on-white text.
    const inverted = background in backgroundVariants && background !== 'default';
    const contentTestId = props['data-testid'] && `${props['data-testid']}-content`;

    // Dev-only guard: an out-of-union `size`/`mediaPlacement`/`titleOrder` silently
    // resolves to `undefined` in the lookups below — `size` drops padding and
    // passes `variant={undefined}` to Typography, which has no fallback of its own
    // (Typography's underlying `Box` falls back to a plain `div`, losing both the
    // heading style and the heading element), `mediaPlacement` silently falls back
    // to the `top` layout, and `titleOrder` silently stops overriding the heading
    // level. `background` isn't checked here — Paper already guards it, and Card
    // just forwards the value (though Card's own `inverted` derivation below
    // degrades safely for an invalid value regardless).
    useEffect(() => {
      if (process.env.NODE_ENV === 'production') return;

      if (!(size in headingVariant)) {
        console.error(`Card: invalid \`size\` value "${size}".`);
      }
      if (mediaPlacement !== 'top' && mediaPlacement !== 'left') {
        console.error(`Card: invalid \`mediaPlacement\` value "${String(mediaPlacement)}".`);
      }
      if (titleOrder !== undefined && !(titleOrder in titleComponent)) {
        console.error(`Card: invalid \`titleOrder\` value "${titleOrder}".`);
      }
    }, [size, mediaPlacement, titleOrder]);

    return (
      <Paper
        ref={ref}
        {...props}
        // Spread after `props` so Card's fixed surface contract always wins,
        // even if a non-TS caller manages to pass one of these Paper props
        // through (`CardProps` doesn't declare them, so a typed caller can't).
        background={background}
        radius="sharp"
        withShadow
        padding="none"
        className={cx(root, media && mediaPlacement === 'left' && rootMediaLeft, className)}
      >
        {media && <div className={mediaClass}>{media}</div>}
        <div
          className={cx(content, contentPaddingVariants[size], inverted && invertedMarker)}
          data-testid={contentTestId}
        >
          <div className={textBlock}>
            {eyebrow && <Typography variant="p2">{eyebrow}</Typography>}
            <Typography
              variant={headingVariant[size]}
              component={titleOrder ? titleComponent[titleOrder] : undefined}
            >
              {title}
            </Typography>
            {children}
          </div>
          {actions}
        </div>
      </Paper>
    );
  }
);

Card.displayName = 'Card';
