import type { MouseEvent, ReactNode } from 'react';
import cx from 'clsx';
import { root } from './SkipLink.css';

export interface SkipLinkProps {
  /** Fragment target to focus on activation. Made focusable automatically if it isn't already. */
  href?: string;
  /** Visible + accessible label. Default is Figma's own copy. */
  children?: ReactNode;
  className?: string;
}

export function SkipLink({
  href = '#main-content',
  children = 'Hyppää pääsisältöön',
  className,
}: SkipLinkProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith('#')) return;
    // Own the navigation ourselves as soon as we've decided to handle this href —
    // before the target lookup, so a missing target can't fall through to the
    // browser's default fragment navigation, which would push a history entry and
    // rewrite location.hash to a dead fragment as an undocumented side effect.
    event.preventDefault();
    const target = document.getElementById(href.slice(1));
    if (!target) {
      if (process.env.NODE_ENV !== 'production') {
        console.error(
          `SkipLink: no element with id "${href.slice(1)}" found for \`href="${href}"\`. ` +
            'The skip link will not move focus anywhere.'
        );
      }
      return;
    }
    // No positive/zero tabIndex — not yet a valid focus target. Covers both a bare
    // landmark (no tabindex at all) and a consumer who forgot tabIndex={-1}.
    if (target.tabIndex < 0) {
      target.setAttribute('tabindex', '-1');
    }
    target.focus();
  };

  return (
    <a href={href} className={cx(root, className)} onClick={handleClick}>
      {children}
    </a>
  );
}
