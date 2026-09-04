import { forwardRef, useEffect, type AnchorHTMLAttributes, type ReactNode } from 'react';
import cx from 'clsx';
import { Paper, type PaperProps, type SurfacePrimitiveProps } from '../Paper';
import { Typography } from '../Typography';
import { ArrowRightIcon, OpenExternalLinkIcon } from '../../icons';
import {
  root,
  media as mediaClass,
  content as contentClass,
  contentPadding,
  textBlock,
  description as descriptionClass,
  iconRow,
  icon as iconClass,
  inverted as invertedMarker,
  link as linkClass,
  leftMarker,
} from './Linkbox.css';

export interface LinkboxProps extends SurfacePrimitiveProps {
  href: string;
  title: string;
  /** Overrides the title's default heading level (3) — e.g. for a Linkbox nested under an existing H2. */
  titleOrder?: 2 | 3 | 4 | 5;
  eyebrow?: string;
  description?: string;
  /**
   * Rendered in a fixed 3:2 frame that bleeds to the box's edge — an `<img>`,
   * `<video>`, `<svg>`, `<iframe>`/`<canvas>` embed, or a wrapped element,
   * cropped with `object-fit: cover`.
   */
  media?: ReactNode;
  /**
   * Ignored when `media` is omitted. Default `'top'`. `'left'` is a 50/50 row
   * split once Linkbox's own rendered width passes the `md` (768px)
   * container-query breakpoint — narrower than that (its own width, not the
   * viewport — e.g. a narrow grid column on an otherwise wide screen) it
   * collapses to the same stacked layout `'top'` uses, since a row split gets
   * cramped past that point.
   */
  mediaPlacement?: 'top' | 'left';
  /** `false` (default) is a white surface with dark text; `true` is a solid Paper `turquoise` surface with contrast text. */
  inverted?: boolean;
  /** Swaps the arrow icon, forces `target="_blank"`, prepends `rel="noopener noreferrer"` (merging with any existing `rel`), and appends `externalLabel` to the accessible name — including a consumer-supplied `aria-label` override. */
  external?: boolean;
  /** Appended to the accessible name when `external` is set — to `title`, or to a consumer's own `aria-label` override if one is given. */
  externalLabel?: string;
  target?: string;
  rel?: string;
  className?: string;
}

const titleComponent = { 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5' } as const;

/** A card-shaped link — the whole box navigates to one destination, unlike `Card`, which is never itself a link. */
// `HTMLDivElement`, not `HTMLAnchorElement`: `component` accepts any
// `ElementType` (inherited from `SurfacePrimitiveProps`), so — same as
// Paper/Card — the type can't promise callers a more specific element than
// that. Promising `HTMLAnchorElement` while `component` stays fully open
// would let a consumer swap in a non-anchor component with no compiler
// warning that the ref's declared type no longer matches what's rendered.
export const Linkbox = forwardRef<HTMLDivElement, LinkboxProps>(function Linkbox(
  {
    href,
    title,
    titleOrder,
    eyebrow,
    description,
    media,
    mediaPlacement = 'top',
    inverted = false,
    external = false,
    externalLabel = '(avautuu uuteen välilehteen)',
    component,
    target,
    rel,
    className,
    ...props
  },
  ref
) {
  // A consumer's own `aria-label` override (see `RespectsConsumerAriaLabelOverride`
  // in the stories) replaces `title` as the base name, but `external`'s
  // screen-reader signal must still be appended either way — dropping it
  // whenever a consumer supplies their own label would silently fail issue
  // #75's "external links flagged to assistive tech" requirement for that case.
  const baseAccessibleName = props['aria-label'] ?? title;
  const accessibleName = external ? `${baseAccessibleName} ${externalLabel}` : baseAccessibleName;
  const linkTarget = external ? '_blank' : target;
  const linkRel = external ? cx('noopener noreferrer', rel) : rel;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    if (external && target) {
      console.error(
        'Linkbox: `target` is ignored when `external` is set — external links always open in a new tab.'
      );
    }
    if (titleOrder !== undefined && !(titleOrder in titleComponent)) {
      console.error(`Linkbox: invalid \`titleOrder\` value "${titleOrder}".`);
    }
    if (mediaPlacement !== 'top' && mediaPlacement !== 'left') {
      console.error(`Linkbox: invalid \`mediaPlacement\` value "${String(mediaPlacement)}".`);
    }
  }, [external, target, titleOrder, mediaPlacement]);

  // `Paper`'s own type doesn't widen anchor attributes when `component="a"`
  // (its manually-typed wrapper can't infer per-element props the way
  // Mantine's raw polymorphic factory does — see Paper.tsx's own cast at
  // its Mantine boundary for the same reason). The object literal is typed
  // explicitly (not inferred from an untyped `as unknown as PaperProps` cast
  // directly on the literal) so a typo'd key still fails `tsc` before it ever
  // reaches that boundary cast.
  const anchorProps: Pick<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target' | 'rel'> & {
    'aria-label': string;
  } = {
    href,
    'aria-label': accessibleName,
    target: linkTarget,
    rel: linkRel,
  };

  return (
    <Paper
      ref={ref}
      {...props}
      component={component ?? 'a'}
      {...(anchorProps as unknown as PaperProps)}
      background={inverted ? 'turquoise' : 'default'}
      radius="sharp"
      withShadow={false}
      padding="none"
      className={cx(
        media && mediaPlacement === 'left' && leftMarker,
        inverted && invertedMarker,
        linkClass,
        className
      )}
    >
      {/* `root` (the flex row/column layout) lives on this inner wrapper, not
          the outer element above — a `@container` query can't restyle the
          same element that establishes the container (see `leftMarker` in
          Linkbox.css.ts), so the container (outer) and the thing whose
          `flexDirection` it toggles (this wrapper) have to be different
          elements. */}
      <div className={root}>
        {media && <div className={mediaClass}>{media}</div>}
        <div className={cx(contentClass, contentPadding)}>
          <div className={textBlock}>
            {eyebrow && <Typography variant="p2">{eyebrow}</Typography>}
            <Typography
              variant="h3"
              component={titleOrder ? titleComponent[titleOrder] : undefined}
            >
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
        </div>
      </div>
    </Paper>
  );
});

Linkbox.displayName = 'Linkbox';
