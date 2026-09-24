import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Footer } from './Footer';
import { coatOfArms, legalLinks } from './Footer.css';

// Fictional example content: real footer copy needs a legal/comms owner (#60).
const legal = {
  cookies: { label: 'Evästeet', href: '#evasteet' },
  accessibilityStatement: { label: 'Saavutettavuusseloste', href: '#saavutettavuusseloste' },
  privacy: { label: 'Tietosuoja ja tiedonhallinta', href: '#tietosuoja' },
  terms: { label: 'Käyttöehdot', href: '#kayttoehdot' },
};

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

export const LogoAndBackToTopCanBeHidden: Story = {
  render: () => <Footer {...legal} showLogo={false} backToTop={false} />,
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

// Type-level tests: `npx tsc --noEmit` fails if either directive stops being needed.
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
