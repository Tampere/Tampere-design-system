import { Fragment } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { PhoneIcon } from '../../icons';
import { NavigationLink } from '../NavigationLink/NavigationLink';
import { TextLink } from '../TextLink/TextLink';
import { Typography } from '../Typography/Typography';
import { Footer, type FooterSocialLink } from './Footer';
import {
  backToTop,
  coatOfArms,
  column,
  legalLinks,
  socialLinks,
  topSection,
  wordmarkBox,
} from './Footer.css';

// Fictional example content: real footer copy needs a legal/comms owner.
const legal = {
  cookies: { label: 'Evästeet', href: '#evasteet' },
  accessibilityStatement: { label: 'Saavutettavuusseloste', href: '#saavutettavuusseloste' },
  privacy: { label: 'Tietosuoja ja tiedonhallinta', href: '#tietosuoja' },
  terms: { label: 'Käyttöehdot', href: '#kayttoehdot' },
};

const socials: FooterSocialLink[] = [
  { service: 'facebook', href: 'https://facebook.example/esimerkki' },
  { service: 'instagram', href: 'https://instagram.example/esimerkki' },
  { service: 'x', href: 'https://x.example/esimerkki' },
  { service: 'linkedin', href: 'https://linkedin.example/esimerkki' },
  { service: 'bluesky', href: 'https://bluesky.example/esimerkki' },
  { service: 'youtube', href: 'https://youtube.example/esimerkki' },
];

const exampleColumns = [
  <Fragment key="contact">
    <div>
      <Typography variant="subheader" component="h2">
        Esimerkkipalvelu
      </Typography>
      <Typography variant="p1">
        PL 123
        <br />
        00000 Esimerkkilä
      </Typography>
    </div>
    <div>
      <Typography variant="subheader" component="h3">
        Vaihde
      </Typography>
      <NavigationLink href="tel:+35830000000" variant="inverted" startIcon={<PhoneIcon />}>
        03 000 000
      </NavigationLink>
    </div>
  </Fragment>,
  <Fragment key="service-point">
    <Typography variant="subheader" component="h2">
      Palvelupiste
    </Typography>
    <TextLink href="mailto:palvelupiste@esimerkki.example">palvelupiste@esimerkki.example</TextLink>
    <NavigationLink href="tel:+358410000000" variant="inverted" startIcon={<PhoneIcon />}>
      041 000 0000
    </NavigationLink>
    <Typography variant="p1">ma–pe klo 9–16</Typography>
  </Fragment>,
  <Fragment key="links">
    {['Organisaatio', 'Päättäjät ja päätökset', 'Talous', 'Strategia'].map((label) => (
      <NavigationLink key={label} href={`#${label}`} variant="inverted">
        {label}
      </NavigationLink>
    ))}
  </Fragment>,
];

const meta = {
  component: Footer,
  tags: ['!dev', '!autodocs'],
  args: legal,
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

const legalLinkNames = (canvasElement: HTMLElement) =>
  within(canvasElement.querySelector(`.${legalLinks}`) as HTMLElement)
    .getAllByRole('link')
    .map((link) => link.textContent);

export const Dense: Story = {
  tags: docExample,
  parameters: {
    docs: {
      description: {
        story:
          'Bottom bar only: copyright and legal links. No coat of arms, back-to-top ' +
          'link or columns — the type rejects them on this variant.',
      },
    },
  },
  render: () => <Footer variant="dense" {...legal} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector('footer')).not.toBeNull();
    await expect(canvasElement.querySelector(`.${coatOfArms}`)).toBeNull();
    await expect(canvas.queryByRole('link', { name: 'Sivun alkuun' })).toBeNull();
    await expect(legalLinkNames(canvasElement)).toEqual([
      'Evästeet',
      'Saavutettavuusseloste',
      'Tietosuoja ja tiedonhallinta',
      'Käyttöehdot',
    ]);
  },
};

export const Default: Story = {
  tags: docExample,
  parameters: {
    docs: {
      description: {
        story:
          'Adds the coat of arms and a "Sivun alkuun" link (`#top` by default: the ' +
          "browser's own top-of-document target, so no JS or id is needed). Mount " +
          '`Footer` directly under `<body>`, not inside `<main>`, `<article>`, `<aside>`, ' +
          '`<nav>` or `<section>`: only a top-level `<footer>` gets the `contentinfo` landmark.',
      },
    },
  },
  render: () => <Footer {...legal} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const coat = canvasElement.querySelector(`.${coatOfArms}`);
    await expect(coat).not.toBeNull();
    await expect(coat).toHaveAttribute('aria-hidden', 'true');
    await expect(canvas.getByRole('link', { name: 'Sivun alkuun' })).toHaveAttribute(
      'href',
      '#top'
    );
  },
};

export const LegalLinksFollowFigmaOrder: Story = {
  // Props passed out of order on purpose: the rendered order must not follow them.
  render: () => (
    <Footer
      terms={legal.terms}
      legalLinks={[{ label: 'Palaute', href: '#palaute' }]}
      privacy={legal.privacy}
      accessibilityStatement={legal.accessibilityStatement}
      cookies={legal.cookies}
    />
  ),
  play: async ({ canvasElement }) => {
    await expect(legalLinkNames(canvasElement)).toEqual([
      'Evästeet',
      'Saavutettavuusseloste',
      'Tietosuoja ja tiedonhallinta',
      'Käyttöehdot',
      'Palaute',
    ]);
  },
};

export const OmittedNamedLegalLinksAreSkipped: Story = {
  render: () => (
    <Footer accessibilityStatement={legal.accessibilityStatement} terms={legal.terms} />
  ),
  play: async ({ canvasElement }) => {
    await expect(legalLinkNames(canvasElement)).toEqual(['Saavutettavuusseloste', 'Käyttöehdot']);
  },
};

export const CoatOfArmsAndBackToTopCanBeHidden: Story = {
  render: () => <Footer {...legal} showCoatOfArms={false} backToTop={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector(`.${coatOfArms}`)).toBeNull();
    await expect(canvas.queryByRole('link', { name: 'Sivun alkuun' })).toBeNull();
  },
};

export const BackToTopHrefAndLabelOverride: Story = {
  render: () => <Footer {...legal} backToTopHref="#sidans-borjan" backToTopLabel="Till början" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Till början' })).toHaveAttribute(
      'href',
      '#sidans-borjan'
    );
  },
};

export const DefaultCopyrightUsesCurrentYear: Story = {
  render: () => <Footer {...legal} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText(`Copyright © Tampereen kaupunki ${new Date().getFullYear()}`)
    ).not.toBeNull();
  },
};

export const CopyrightTextOverride: Story = {
  render: () => <Footer {...legal} copyrightText="© Esimerkkipalvelu" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('© Esimerkkipalvelu')).not.toBeNull();
    await expect(canvas.queryByText(/Tampereen kaupunki/)).toBeNull();
  },
};

// Type-level tests: `npx tsc --noEmit` fails if any directive stops being needed.
export const AccessibilityStatementIsRequired: Story = {
  render: () => (
    // @ts-expect-error — accessibilityStatement is required (Act 306/2019)
    <Footer cookies={legal.cookies} />
  ),
};

export const DenseRejectsDefaultOnlyProps: Story = {
  render: () => (
    // @ts-expect-error — backToTop exists only on the default variant
    <Footer variant="dense" backToTop {...legal} />
  ),
};

export const DenseRejectsColumns: Story = {
  render: () => (
    // @ts-expect-error — columns exist only on the default variant
    <Footer variant="dense" columns={[]} {...legal} />
  ),
};

export const DenseRejectsSocialLinks: Story = {
  render: () => (
    // @ts-expect-error — socialLinks exist only on the default variant
    <Footer variant="dense" socialLinks={[]} {...legal} />
  ),
};

export const Extended: Story = {
  tags: docExample,
  parameters: {
    docs: {
      description: {
        story:
          'Passing `columns` adds the section above the bar: the Tampere wordmark ' +
          'and the social links are built in; each column is your own content. ' +
          'Typography and TextLink inside columns turn white automatically. For phone numbers, use an inverted `NavigationLink` with a ' +
          '`tel:` href and `startIcon={<PhoneIcon />}`: no underline at rest, still one tap to call.',
      },
    },
  },
  render: () => <Footer {...legal} columns={exampleColumns} socialLinks={socials} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(`.${wordmarkBox} svg`)).not.toBeNull();
    await expect(canvasElement.querySelectorAll(`.${column}`)).toHaveLength(3);
    const phone = within(canvasElement).getByRole('link', { name: '041 000 0000' });
    await expect(phone).toHaveAttribute('href', 'tel:+358410000000');
    await expect(phone.querySelector('svg')).not.toBeNull();
    await expect(getComputedStyle(phone).color).toBe('rgb(255, 255, 255)');
    const socialList = canvasElement.querySelector(`.${socialLinks}`) as HTMLElement;
    const links = within(socialList).getAllByRole('link');
    await expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      'Facebook',
      'Instagram',
      'X',
      'LinkedIn',
      'Bluesky',
      'YouTube',
    ]);
    await expect(links.map((link) => link.getAttribute('href'))).toEqual(
      socials.map((s) => s.href)
    );
    await expect(links.every((link) => link.querySelector('svg'))).toBe(true);
    // Figma shows white icons on the blue background.
    await expect(links.every((link) => getComputedStyle(link).color === 'rgb(255, 255, 255)')).toBe(
      true
    );
  },
};

export const SocialLinkCustomLabel: Story = {
  render: () => (
    <Footer
      {...legal}
      columns={exampleColumns}
      socialLinks={[
        {
          service: 'tiktok',
          href: 'https://tiktok.example/esimerkki',
          label: 'Esimerkkipalvelu TikTokissa',
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('link', { name: 'Esimerkkipalvelu TikTokissa' })).toHaveAttribute(
      'href',
      'https://tiktok.example/esimerkki'
    );
  },
};

export const NoSocialRowWhenEmpty: Story = {
  render: () => <Footer {...legal} columns={exampleColumns} socialLinks={[]} />,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector(`.${socialLinks}`)).toBeNull();
    await expect(canvasElement.querySelector(`.${wordmarkBox}`)).not.toBeNull();
  },
};

export const TopSectionNeedsColumns: Story = {
  render: () => <Footer {...legal} socialLinks={socials} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvasElement.querySelector(`.${topSection}`)).toBeNull();
    await expect(canvas.queryByRole('link', { name: 'Facebook' })).toBeNull();
  },
};

export const ColumnTextIsWhite: Story = {
  render: () => <Footer {...legal} columns={exampleColumns} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const white = 'rgb(255, 255, 255)';
    await expect(getComputedStyle(canvas.getByText('Esimerkkipalvelu')).color).toBe(white);
    await expect(getComputedStyle(canvas.getByText('ma–pe klo 9–16')).color).toBe(white);
    await expect(
      getComputedStyle(canvas.getByRole('link', { name: 'palvelupiste@esimerkki.example' })).color
    ).toBe(white);
  },
};

const overlapsVertically = (a: Element, b: Element) => {
  const first = a.getBoundingClientRect();
  const second = b.getBoundingClientRect();
  return first.top < second.bottom && second.top < first.bottom;
};

export const ResponsiveLayout: Story = {
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ margin: '-3rem' }}>
        <Story />
      </div>
    ),
  ],
  render: () => <Footer {...legal} columns={exampleColumns} socialLinks={socials} />,
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    const get = (className: string) => canvasElement.querySelector(`.${className}`) as HTMLElement;
    const cases = [
      // [viewport, columns on the first row, socials beside wordmark,
      //  copyright beside coat of arms, links beside copyright, back-to-top beside links]
      [2200, 3, true, true, true, true], // xxl (Figma 1920)
      [1200, 3, true, true, false, true], // xl (Figma 1440)
      [1000, 3, true, true, false, true], // lg (Figma 1024)
      [740, 2, true, true, false, false], // md (Figma 768)
      [470, 1, false, true, false, false], // sm (Figma 480)
      [300, 1, false, false, false, false], // xs (Figma 320)
    ] as const;

    try {
      await document.fonts.ready;
      for (const [
        width,
        firstRowColumns,
        socialsBeside,
        copyrightBeside,
        linksBeside,
        topBeside,
      ] of cases) {
        await page.viewport(width, 900);
        const columnEls = [...canvasElement.querySelectorAll(`.${column}`)];
        const onFirstRow = columnEls.filter((el) => overlapsVertically(el, columnEls[0])).length;
        const copyrightEl = within(canvasElement).getByText(/^Copyright ©/);

        await expect({ width, onFirstRow }).toEqual({ width, onFirstRow: firstRowColumns });
        await expect({
          width,
          socials: overlapsVertically(get(wordmarkBox), get(socialLinks)),
        }).toEqual({
          width,
          socials: socialsBeside,
        });
        await expect({
          width,
          copyright: overlapsVertically(get(coatOfArms), copyrightEl),
        }).toEqual({
          width,
          copyright: copyrightBeside,
        });
        await expect({ width, links: overlapsVertically(copyrightEl, get(legalLinks)) }).toEqual({
          width,
          links: linksBeside,
        });
        await expect({ width, top: overlapsVertically(get(legalLinks), get(backToTop)) }).toEqual({
          width,
          top: topBeside,
        });
        // The 348px wordmark minimum overflows at 300; it must not scroll the page.
        await expect({ width, scroll: document.documentElement.scrollWidth }).toEqual({
          width,
          scroll: width,
        });
        const overflowingColumns = columnEls.filter((el) => el.scrollWidth > el.clientWidth);
        await expect({ width, overflow: overflowingColumns.length }).toEqual({
          width,
          overflow: 0,
        });
      }
    } finally {
      await page.viewport(1280, 720);
    }
  },
};

export const ColumnsStayWithinTopSectionAtExtremeNarrowWidths: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <Footer {...legal} columns={exampleColumns} socialLinks={socials} />,
  play: async ({ canvasElement }) => {
    const { page } = await import('@vitest/browser/context');
    try {
      // Narrower than xs's own row (320): the uncapped column minimum used to
      // outgrow the section and get clipped by its overflow:hidden.
      await page.viewport(260, 900);
      await document.fonts.ready;
      const topSectionEl = canvasElement.querySelector(`.${topSection}`) as HTMLElement;
      const rightEdge =
        topSectionEl.getBoundingClientRect().right -
        parseFloat(getComputedStyle(topSectionEl).paddingRight);
      const columnEls = [...canvasElement.querySelectorAll(`.${column}`)];
      for (const el of columnEls) {
        await expect(el.getBoundingClientRect().right).toBeLessThanOrEqual(rightEdge);
      }
    } finally {
      await page.viewport(1280, 720);
    }
  },
};

export const ColumnItemsAreSpacedLikeFigma: Story = {
  // Figma's column item gap is spacing.sm: 16px at the default 1280px (xl) viewport.
  render: () => <Footer {...legal} columns={exampleColumns} />,
  play: async ({ canvasElement }) => {
    const lastColumn = [...canvasElement.querySelectorAll(`.${column}`)].at(-1) as HTMLElement;
    const links = within(lastColumn).getAllByRole('link');
    const gaps = links
      .slice(1)
      .map(
        (link, index) =>
          link.getBoundingClientRect().top - links[index].getBoundingClientRect().bottom
      );
    await expect(gaps).toEqual([16, 16, 16]);
  },
};
