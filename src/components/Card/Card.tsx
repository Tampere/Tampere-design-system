import type { ReactNode } from 'react';
import cx from 'clsx';
import { Paper, type PaperProps } from '../Paper';
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

export interface CardProps {
  /** `'lg'` → H2 heading + Paper's `lg` padding. `'md'`/`'sm'` → H3 heading + matching padding. */
  size?: 'lg' | 'md' | 'sm';
  background?: PaperProps['background'];
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
  'data-testid'?: string;
}

const headingVariant = { lg: 'h2', md: 'h3', sm: 'h3' } as const;
const titleComponent = { 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5' } as const;

/** A static content tile. Not itself a link — nested interactive elements (in `actions`/`children`) stay independently focusable. */
export function Card({
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
}: CardProps) {
  // Assumes every non-default background is dark enough to need contrast text.
  // Holds for today's three (turquoise/blue/pink) — revisit if `red`/`yellow`/
  // `green` are ever added to `PaperProps['background']` (see Paper.tsx), since
  // a light one would need this to key off a per-background contrast token
  // instead of a blanket `!== 'default'` check.
  const inverted = background !== 'default';
  const contentTestId = props['data-testid'] && `${props['data-testid']}-content`;

  return (
    <Paper
      background={background}
      radius="sharp"
      withShadow
      padding="none"
      className={cx(root, media && mediaPlacement === 'left' && rootMediaLeft, className)}
      {...props}
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
