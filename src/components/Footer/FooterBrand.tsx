import type { ComponentType, SVGProps } from 'react';
import {
  BlueskyIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedInIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from '../../icons';
import { TampereLogo } from '../../logos/TampereLogo';
import { IconButton } from '../IconButton/IconButton';
import type { FooterSocialLink, FooterSocialService } from './Footer';
import { brandRow, socialLinks as socialLinksClass, wordmark, wordmarkBox } from './Footer.css';

const services: Record<
  FooterSocialService,
  { name: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  facebook: { name: 'Facebook', Icon: FacebookIcon },
  instagram: { name: 'Instagram', Icon: InstagramIcon },
  x: { name: 'X', Icon: XIcon },
  linkedin: { name: 'LinkedIn', Icon: LinkedInIcon },
  bluesky: { name: 'Bluesky', Icon: BlueskyIcon },
  youtube: { name: 'YouTube', Icon: YouTubeIcon },
  tiktok: { name: 'TikTok', Icon: TikTokIcon },
};

export function FooterBrand({ socialLinks = [] }: { socialLinks?: FooterSocialLink[] }) {
  return (
    <div className={brandRow}>
      <div className={wordmarkBox}>
        <TampereLogo variant="light" className={wordmark} aria-hidden="true" />
      </div>
      {socialLinks.length ? (
        <ul className={socialLinksClass}>
          {socialLinks.map(({ service, href, label }) => {
            const { name, Icon } = services[service];
            return (
              <li key={href}>
                <IconButton
                  component="a"
                  href={href}
                  variant="inverted"
                  size="lg"
                  aria-label={label ?? name}
                >
                  <Icon />
                </IconButton>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
