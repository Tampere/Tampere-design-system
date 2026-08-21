import type { AnchorHTMLAttributes, ReactElement } from 'react';
import { useEffect } from 'react';
import cx from 'clsx';
import { OpenExternalLinkIcon } from '../../icons';
import {
  size as sizeStyles,
  link,
  externalIcon,
  visuallyHidden,
  type TextLinkSize,
} from './TextLink.css';

export type { TextLinkSize };

export interface TextLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href?: string;
  size?: TextLinkSize;
  visited?: boolean;
  openExternal?: boolean;
  className?: string;
  /**
   * Escape hatch for router-integrated links (e.g. React Router's `Link`).
   * When provided, it fully replaces the rendered `<a>` — `href`,
   * `openExternal` (and the target/rel/icon it would otherwise add), and any
   * other anchor props are NOT applied. Add them to the custom element
   * yourself if you need them.
   */
  renderLink?: (className: string) => ReactElement;
}

export function TextLink({
  href,
  size = 'p1',
  visited = false,
  openExternal = false,
  children,
  className,
  renderLink,
  target,
  rel,
  ...props
}: TextLinkProps) {
  const classes = cx(sizeStyles[size], visited ? link.visited : link.unvisited, className);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (!href && !renderLink) {
      console.error(
        'TextLink: provide either `href` or `renderLink` so the link has a destination.'
      );
    }
    if (href && renderLink) {
      console.error(
        'TextLink: `href` is ignored when `renderLink` is provided — remove one of them.'
      );
    }
  }, [href, renderLink]);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && openExternal && renderLink) {
      console.error(
        'TextLink: `openExternal` has no effect when `renderLink` is provided — target, rel, and the external-link icon are only applied to the default `<a>` render. Add them to your custom link element instead.'
      );
    }
  }, [openExternal, renderLink]);

  if (renderLink) {
    return renderLink(classes);
  }

  return (
    <a
      href={href}
      className={classes}
      target={openExternal ? '_blank' : target}
      rel={openExternal ? 'noopener noreferrer' : rel}
      {...props}
    >
      {children}
      {openExternal && (
        <>
          {/* U+2060 word joiner: keeps the icon from wrapping onto its own
              line, separate from the last word of link text. */}
          {'⁠'}
          <OpenExternalLinkIcon aria-hidden className={externalIcon} />
          <span className={visuallyHidden}> (avautuu uuteen välilehteen)</span>
        </>
      )}
    </a>
  );
}
