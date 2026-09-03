import { useEffect, type AriaAttributes, type AriaRole, type ElementType } from 'react';
import cx from 'clsx';
import { Paper, type PaperProps } from '../Paper';
import { Typography } from '../Typography';
import { ArrowRightIcon, OpenExternalLinkIcon } from '../../icons';
import {
  root,
  textBlock,
  description as descriptionClass,
  iconRow,
  icon as iconClass,
  inverted as invertedMarker,
  link as linkClass,
} from './Linkbox.css';

export interface LinkboxProps extends AriaAttributes {
  href?: string;
  title: string;
  /** Overrides the title's default heading level (3) — e.g. for a Linkbox nested under an existing H2. */
  titleOrder?: 2 | 3 | 4 | 5;
  eyebrow?: string;
  description?: string;
  /** `false` (default) is a white surface with dark text; `true` is a solid Paper `turquoise` surface with contrast text. */
  inverted?: boolean;
  /** Swaps the arrow icon, forces `target="_blank"` + `rel="noopener noreferrer"`, and appends `externalLabel` to the accessible name. */
  external?: boolean;
  /** Appended to the accessible name when `external` is set. */
  externalLabel?: string;
  /** Polymorphic root element, e.g. a router `Link` component. Mirrors Paper/Card's own `component` prop — the whole box is always this element. */
  component?: ElementType;
  target?: string;
  rel?: string;
  className?: string;
  id?: string;
  role?: AriaRole;
  'data-testid'?: string;
}

const titleComponent = { 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5' } as const;

/** A card-shaped link — the whole box navigates to one destination, unlike `Card`, which is never itself a link. */
export function Linkbox({
  href,
  title,
  titleOrder,
  eyebrow,
  description,
  inverted = false,
  external = false,
  externalLabel = ' (avautuu uuteen välilehteen)',
  component,
  target,
  rel,
  className,
  ...props
}: LinkboxProps) {
  const accessibleName = external ? `${title}${externalLabel}` : title;
  const linkTarget = external ? '_blank' : target;
  const linkRel = external ? cx('noopener noreferrer', rel) : rel;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    if (!href) {
      console.error('Linkbox: provide `href` so the link has a destination.');
    }
    if (external && target) {
      console.error(
        'Linkbox: `target` is ignored when `external` is set — external links always open in a new tab.'
      );
    }
  }, [href, external, target]);

  // `Paper`'s own type doesn't widen anchor attributes when `component="a"`
  // (its manually-typed wrapper can't infer per-element props the way
  // Mantine's raw polymorphic factory does — see Paper.tsx's own cast at
  // its Mantine boundary for the same reason). Cast at this one boundary
  // rather than losing type safety on the rest of `LinkboxProps`.
  const anchorProps = {
    href,
    'aria-label': props['aria-label'] ?? accessibleName,
    target: linkTarget,
    rel: linkRel,
  } as unknown as PaperProps;

  return (
    <Paper
      {...props}
      component={component ?? 'a'}
      {...anchorProps}
      background={inverted ? 'turquoise' : 'default'}
      radius="sharp"
      withShadow={false}
      padding="md"
      className={cx(root, inverted && invertedMarker, linkClass, className)}
    >
      <div className={textBlock}>
        {eyebrow && <Typography variant="p2">{eyebrow}</Typography>}
        <Typography variant="h3" component={titleOrder ? titleComponent[titleOrder] : undefined}>
          {title}
        </Typography>
        {description && (
          <Typography variant="p1" className={descriptionClass}>
            {description}
          </Typography>
        )}
      </div>
      <div className={iconRow}>
        {external ? (
          <OpenExternalLinkIcon aria-hidden className={iconClass} />
        ) : (
          <ArrowRightIcon aria-hidden className={iconClass} />
        )}
      </div>
    </Paper>
  );
}

Linkbox.displayName = 'Linkbox';
