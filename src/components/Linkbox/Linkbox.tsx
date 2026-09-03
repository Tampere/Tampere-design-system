import {
  useEffect,
  type AriaAttributes,
  type AriaRole,
  type ReactElement,
  type ReactNode,
} from 'react';
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
  overlayLink,
  positionedContent,
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
  /**
   * Nested interactive content (e.g. a `Button`) rendered after the text
   * content. Presence of `actions` (like `renderLink`) switches Linkbox from
   * simple mode (the whole box is one real `<a>`) to the
   * nested-interactive/overlay-link pattern, so `actions`' own links/buttons
   * stay independently clickable.
   */
  actions?: ReactNode;
  /**
   * Escape hatch for router-integrated links (e.g. React Router's `Link`),
   * mirroring TextLink's `renderLink`. Fully replaces the primary link
   * element (the covering overlay anchor) — `href`/`external`/`target`/`rel`
   * and the accessible name are NOT applied to it. Add them to the custom
   * element yourself if you need them. Providing `renderLink` (like
   * `actions`) switches Linkbox to the overlay-link structure.
   */
  renderLink?: (className: string) => ReactElement;
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
  actions,
  renderLink,
  target,
  rel,
  className,
  ...props
}: LinkboxProps) {
  // A custom router `renderLink` has no visible content of its own to carry
  // Linkbox's generated eyebrow/title/description — same reason `actions`
  // does, it needs the overlay structure rather than `Paper` itself being
  // the anchor.
  const nested = actions != null || renderLink != null;
  const accessibleName = external ? `${title}${externalLabel}` : title;
  const linkTarget = external ? '_blank' : target;
  const linkRel = external ? cx('noopener noreferrer', rel) : rel;

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;

    if (!href && !renderLink) {
      console.error(
        'Linkbox: provide either `href` or `renderLink` so the link has a destination.'
      );
    }
    if (renderLink && href) {
      console.error(
        'Linkbox: `href` is ignored when `renderLink` is provided — remove one of them.'
      );
    }
    if (renderLink && external) {
      console.error(
        'Linkbox: `external` has no effect when `renderLink` is provided — target, rel, and the external-link icon are only applied to the default `<a>` render. Add them to your custom link element instead.'
      );
    }
    if (external && target) {
      console.error(
        'Linkbox: `target` is ignored when `external` is set — external links always open in a new tab.'
      );
    }
  }, [href, renderLink, external, target]);

  const content = (
    <>
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
    </>
  );

  const surfaceProps = {
    ...props,
    background: inverted ? ('turquoise' as const) : ('default' as const),
    radius: 'sharp' as const,
    withShadow: false,
    padding: 'md' as const,
  };

  if (nested) {
    return (
      <Paper {...surfaceProps} className={cx(root, inverted && invertedMarker, className)}>
        {renderLink ? (
          renderLink(overlayLink)
        ) : (
          <a
            href={href}
            className={overlayLink}
            aria-label={accessibleName}
            target={linkTarget}
            rel={linkRel}
          />
        )}
        <div className={positionedContent}>{content}</div>
        {actions && <div className={positionedContent}>{actions}</div>}
      </Paper>
    );
  }

  // `Paper`'s own type doesn't widen anchor attributes when `component="a"`
  // (its manually-typed wrapper can't infer per-element props the way
  // Mantine's raw polymorphic factory does — see Paper.tsx's own cast at
  // its Mantine boundary for the same reason). Cast at this one boundary
  // rather than losing type safety on the rest of `LinkboxProps`.
  const anchorProps = {
    href,
    'aria-label': accessibleName,
    target: linkTarget,
    rel: linkRel,
  } as unknown as PaperProps;

  return (
    <Paper
      {...surfaceProps}
      component="a"
      {...anchorProps}
      className={cx(root, inverted && invertedMarker, linkClass, className)}
    >
      {content}
    </Paper>
  );
}

Linkbox.displayName = 'Linkbox';
