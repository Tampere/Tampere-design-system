import type { ReactNode } from 'react';
import { TampereVaakuna } from '../../logos/TampereVaakuna';
import { brandLink, leftSection, primaryLogo } from './AppHeader.css';

export interface AppHeaderBrandProps {
  siteName?: ReactNode;
  homeHref: string;
  /** The site name's type class — `h5` in multi-row, `subheader` in single-row, per Figma. */
  siteNameClassName: string;
  /** The wrapping div's class. Default `leftSection`; single-row passes its own gapped variant. */
  className?: string;
}

export function AppHeaderBrand({
  siteName,
  homeHref,
  siteNameClassName,
  className = leftSection,
}: AppHeaderBrandProps) {
  return (
    <div className={className}>
      {/* The link wraps the logo only: an accessible name concatenating
          "Tampere" with an arbitrary site name reads poorly and changes
          per consumer. */}
      <a href={homeHref} className={brandLink} aria-label="Tampere">
        <TampereVaakuna className={primaryLogo} />
      </a>
      {siteName ? <span className={siteNameClassName}>{siteName}</span> : null}
    </div>
  );
}
