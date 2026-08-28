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
  /** `'large'` → H2 heading + Paper's `large` padding. `'medium'`/`'small'` → H3 heading + matching padding. */
  size?: 'large' | 'medium' | 'small';
  background?: PaperProps['background'];
  media?: ReactNode;
  /** Ignored when `media` is omitted. Default `'top'`. */
  mediaPlacement?: 'top' | 'left';
  title: string;
  /** Optional small text above the title. */
  eyebrow?: string;
  /** Optional slot rendered after the body content. */
  actions?: ReactNode;
  /** Body content between the title and `actions` — text, Buttons, other components. */
  children?: ReactNode;
  'data-testid'?: string;
}

const headingVariant = { large: 'h2', medium: 'h3', small: 'h3' } as const;

/** A static content tile. Not itself a link — nested interactive elements (in `actions`/`children`) stay independently focusable. */
export function Card({
  size = 'large',
  background = 'default',
  media,
  mediaPlacement = 'top',
  title,
  eyebrow,
  actions,
  children,
  ...props
}: CardProps) {
  const inverted = background !== 'default';

  return (
    <Paper
      background={background}
      radius="sharp"
      withShadow
      padding="none"
      className={cx(root, media && mediaPlacement === 'left' && rootMediaLeft)}
      {...props}
    >
      {media && <div className={mediaClass}>{media}</div>}
      <div className={cx(content, contentPaddingVariants[size])} data-testid="card-content">
        <div className={cx(textBlock, inverted && invertedMarker)}>
          {eyebrow && <Typography variant="p2">{eyebrow}</Typography>}
          <Typography variant={headingVariant[size]}>{title}</Typography>
          {children}
        </div>
        {actions}
      </div>
    </Paper>
  );
}
