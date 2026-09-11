import type { ReactNode } from 'react';
import { TampereVaakuna } from '../../logos/TampereVaakuna';
import { brandLink, leftSection, primaryLogo } from './AppHeader.css';

export interface AppHeaderBrandProps {
  siteName?: ReactNode;
  homeHref: string;
  /** The site name's type class — `h5` in multi-row, `subheader` in single-row, per Figma. */
  siteNameClassName: string;
}

export function AppHeaderBrand({ siteName, homeHref, siteNameClassName }: AppHeaderBrandProps) {
  return (
    <div className={leftSection}>
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
