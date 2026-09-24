import type { MouseEvent, ReactNode } from 'react';
import { ArrowUpIcon } from '../../icons';
import { TampereVaakunaWhite } from '../../logos/TampereVaakunaWhite';
import { NavigationLink } from '../NavigationLink/NavigationLink';
import { moveFocusTo } from '../../utils';
import { FooterBrand } from './FooterBrand';
import {
  backToTop,
  bar,
  barContent,
  coatOfArms,
  column,
  columns as columnsClass,
  copyright,
  legalLinks,
  topSection,
} from './Footer.css';

export interface FooterLink {
  label: string;
  href: string;
}

export type FooterSocialService =
  | 'facebook'
  | 'instagram'
  | 'x'
  | 'linkedin'
  | 'bluesky'
  | 'youtube'
  | 'tiktok';

export interface FooterSocialLink {
  service: FooterSocialService;
  href: string;
  /** Accessible name. Default: the service's name, e.g. "Facebook". */
  label?: string;
}

interface FooterBaseProps {
  /** Default: "Copyright © Tampereen kaupunki {current year}". Renders inside
   * a `<p>`, so must be inline (phrasing) content. */
  copyrightText?: ReactNode;
  /** The legal links always render in Figma's order: cookies, accessibilityStatement,
   * privacy, terms, then `legalLinks`. */
  cookies?: FooterLink;
  /** Required: the accessibility statement obligation (Act 306/2019) is unconditional. */
  accessibilityStatement: FooterLink;
  privacy?: FooterLink;
  terms?: FooterLink;
  /** Any further legal links, after the named ones, in the given order. */
  legalLinks?: FooterLink[];
  className?: string;
}

export type FooterProps =
  | (FooterBaseProps & {
      /** Copyright and legal links only (Figma "Dense"). */
      variant: 'dense';
    })
  | (FooterBaseProps & {
      /** Adds the coat of arms and back-to-top link; with `columns`, also the
       * brand row and columns above the bar (Figma "Extended"). */
      variant?: 'default';
      /** Default true. */
      showCoatOfArms?: boolean;
      /** Default true. */
      backToTop?: boolean;
      /** Default '#top', the browser's built-in top-of-document target. Activating the
       * link also moves keyboard focus to the target. */
      backToTopHref?: string;
      /** Default 'Sivun alkuun'. */
      backToTopLabel?: string;
      /** One entry per column. Footer only lays them out; Typography and TextLink
       * inside are forced to white for the blue background. */
      columns?: ReactNode[];
      /** Icon links beside the wordmark, in the given order. Shown only with `columns`. */
      socialLinks?: FooterSocialLink[];
    });

// The browser scrolls to a fragment but leaves keyboard focus on the link, so the
// next Tab would continue from the bottom of the page.
function focusBackToTopTarget(event: MouseEvent<HTMLAnchorElement>) {
  const href = event.currentTarget.getAttribute('href') ?? '';
  if (!href.startsWith('#')) return;
  const id = href.slice(1);
  // Same fallback as the browser's own fragment lookup: an empty fragment or an
  // unmatched `#top` means the start of the document.
  const isDocumentTop = id === '' || id.toLowerCase() === 'top';
  const target = document.getElementById(id) ?? (isDocumentTop ? document.body : null);
  if (target) moveFocusTo(target);
}

export function Footer(props: FooterProps) {
  const {
    copyrightText = `Copyright © Tampereen kaupunki ${new Date().getFullYear()}`,
    cookies,
    accessibilityStatement,
    privacy,
    terms,
    legalLinks: extraLegalLinks = [],
    className,
  } = props;
  const defaultVariant = props.variant === 'dense' ? null : props;
  const links = [cookies, accessibilityStatement, privacy, terms, ...extraLegalLinks].filter(
    (link): link is FooterLink => Boolean(link)
  );

  return (
    <footer className={className}>
      {defaultVariant?.columns?.length ? (
        <div className={topSection}>
          <FooterBrand socialLinks={defaultVariant.socialLinks} />
          <div className={columnsClass}>
            {defaultVariant.columns.map((content, index) => (
              // Columns are positional and never reorder.
              <div key={index} className={column}>
                {content}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className={bar[defaultVariant ? 'default' : 'dense']}>
        <div className={barContent}>
          {defaultVariant && defaultVariant.showCoatOfArms !== false ? (
            <TampereVaakunaWhite className={coatOfArms} aria-hidden="true" />
          ) : null}
          <p className={copyright}>{copyrightText}</p>
          <ul className={legalLinks}>
            {links.map((link) => (
              <li key={`${link.href} ${link.label}`}>
                <NavigationLink href={link.href} variant="inverted" size="sm">
                  {link.label}
                </NavigationLink>
              </li>
            ))}
          </ul>
          {defaultVariant && defaultVariant.backToTop !== false ? (
            <div className={backToTop}>
              <NavigationLink
                href={defaultVariant.backToTopHref ?? '#top'}
                variant="inverted"
                endIcon={<ArrowUpIcon />}
                onClick={focusBackToTopTarget}
              >
                {defaultVariant.backToTopLabel ?? 'Sivun alkuun'}
              </NavigationLink>
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
