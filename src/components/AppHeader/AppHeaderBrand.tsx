import type { ReactNode } from 'react';
import { TampereVaakuna } from '../../logos/TampereVaakuna';
import { brandLink, leftSection, primaryLogo, siteName as siteNameClass } from './AppHeader.css';

export interface AppHeaderBrandProps {
  siteName?: ReactNode;
  homeHref: string;
}

export function AppHeaderBrand({ siteName, homeHref }: AppHeaderBrandProps) {
  return (
    <div className={leftSection}>
      {/* The link wraps the logo only: an accessible name concatenating
          "Tampere" with an arbitrary site name reads poorly and changes
          per consumer. */}
      <a href={homeHref} className={brandLink} aria-label="Tampere">
        <TampereVaakuna className={primaryLogo} />
      </a>
      {siteName ? <span className={siteNameClass}>{siteName}</span> : null}
    </div>
  );
}
