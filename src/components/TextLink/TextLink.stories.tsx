import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Typography } from '../Typography';
import { TextLink, type TextLinkSize } from './TextLink';

const meta = {
  component: TextLink,
  // Most TextLink stories are browser test specs (they have a `play` fn), not
  // documentation. Default every story to test-only: still run by the vitest
  // addon (the `test` tag is untouched) but hidden from the sidebar (`!dev`) and
  // the autodocs page (`!autodocs`) so the docs stay a small, curated set. The
  // documentation examples below opt back in with `tags: docExample`.
  tags: ['!dev', '!autodocs'],
  argTypes: {
    href: { control: 'text', description: 'Link destination URL' },
    size: {
      control: { type: 'select' },
      options: ['h1', 'h2', 'h3', 'h4', 'h5', 'subheader', 'p1', 'p2', 'caption'],
      description: 'Typography scale the link renders at',
    },
    visited: { control: 'boolean', description: 'Whether the link has been visited' },
    openExternal: {
      control: 'boolean',
      description: 'Shows an external-link icon and opens in a new tab',
    },
    children: { control: 'text', description: 'Link text' },
  },
  args: {
    href: '#',
    children: 'Tekstilinkki',
    size: 'p1',
    visited: false,
    openExternal: false,
  },
} satisfies Meta<typeof TextLink>;

export default meta;
type Story = StoryObj<typeof meta>;

// Re-adds the visibility tags that `meta` strips, marking a story as a
// documentation example shown in both the sidebar and the autodocs page.
const docExample = ['dev', 'autodocs'];

// ── Documentation examples (visible in sidebar + autodocs) ───────────────────
// These cover every distinct visual state; the interactive behaviours (focus,
// keyboard nav) are discoverable by interacting with them, so the
// behavioural/a11y stories further down stay test-only to keep docs focused.

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Tekstilinkki' });
    const style = getComputedStyle(link);
    // Figma "Default, unvisited" = text/link = #29549a = states.default
    await expect(style.color).toBe('rgb(41, 84, 154)');
    await expect(style.textDecorationLine).toBe('underline');
    await expect(link).toHaveAttribute('href', '#');
  },
};

export const Visited: Story = {
  tags: docExample,
  args: { visited: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Tekstilinkki' });
    const style = getComputedStyle(link);
    // states.visited — see theme.ts for the WCAG AA contrast rationale.
    await expect(style.color).toBe('rgb(23, 47, 90)');
    await expect(style.textDecorationLine).toBe('underline');
  },
};

export const OpenExternal: Story = {
  tags: docExample,
  args: { openExternal: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: /^Tekstilinkki/ });
    await expect(link).toHaveAttribute('target', '_blank');
    await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(link.querySelector('svg')).not.toBeNull();
    await expect(link).toHaveAccessibleName(/avautuu uuteen välilehteen/);
  },
};

const ALL_SIZES = [
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'subheader',
  'p1',
  'p2',
  'caption',
] as const satisfies readonly TextLinkSize[];

export const Sizes: Story = {
  tags: docExample,
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'flex-start' }}>
      {ALL_SIZES.map((size) => (
        <TextLink {...args} key={size} size={size} openExternal href={`#${size}`}>
          {size.toUpperCase()} sized link
        </TextLink>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fontSizes: number[] = [];
    for (const size of ALL_SIZES) {
      const link = canvas.getByRole('link', {
        name: new RegExp(`^${size.toUpperCase()} sized link`),
      });
      await expect(link.querySelector('svg')).not.toBeNull();
      fontSizes.push(parseFloat(getComputedStyle(link).fontSize));
    }
    // Every size must render no larger than the previous one — proves `size`
    // drives the typography token across the whole scale (not just the two
    // extremes) and that the icon renders at each of them. Non-strict: e.g.
    // `subheader` and `p1` share a font size by design at every breakpoint.
    for (let i = 1; i < fontSizes.length; i++) {
      await expect(fontSizes[i]).toBeLessThanOrEqual(fontSizes[i - 1]);
    }
  },
};

export const WithCustomLink: Story = {
  tags: docExample,
  render: (args) => (
    <TextLink
      {...args}
      renderLink={(className) => (
        <a href="#custom" className={className}>
          Custom link component
        </a>
      )}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Custom link component' });
    await expect(link).toHaveAttribute('href', '#custom');
    const style = getComputedStyle(link);
    // The renderLink escape hatch still receives TextLink's link styling.
    await expect(style.color).toBe('rgb(41, 84, 154)');
  },
};

export const InParagraph: Story = {
  tags: docExample,
  render: (args) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 480 }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Typography variant="p1">
          Tampereen kaupungin palveluista, kuten varhaiskasvatuksesta, terveyspalveluista ja
          asumisen tuista, löydät ajantasaista tietoa kootusti{' '}
          <TextLink {...args} size="p1" href="#lisatietoa">
            verkkosivuiltamme
          </TextLink>
          , joilta voit myös varata ajan asiointiin, seurata kaupungin päätöksentekoa ja lähettää
          palautetta suoraan vastuuvirkailijalle.
        </Typography>
        <Typography variant="p2">
          Jos tarvitset henkilökohtaista opastusta esimerkiksi asumistuen hakemisessa tai
          rakennusluvan täyttämisessä, voit helposti{' '}
          <TextLink {...args} size="p2" href="#varaa-aika">
            varata ajan neuvontapalveluun
          </TextLink>{' '}
          arkisin kello 9–16 välillä, jolloin asiantuntijamme auttaa sinua täyttämään tarvittavat
          lomakkeet ja vastaa kysymyksiisi.
        </Typography>
        <Typography variant="caption">
          Ennen yhteydenottoa asiakaspalveluun kannattaa aina tarkistaa ensin, löytyykö vastaus
          kysymykseesi jo kootusti sivustomme{' '}
          <TextLink {...args} size="caption" href="#ukk">
            usein kysytyt kysymykset
          </TextLink>{' '}
          -osiosta, johon on koottu vastaukset asumiseen, varhaiskasvatukseen ja terveyspalveluihin
          liittyviin yleisimpiin kysymyksiin.
        </Typography>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Typography variant="p1">
          Kaupungin osallistumis- ja vaikuttamismahdollisuuksista, kuten asukasraadeista, kyselyistä
          ja osallistuvasta budjetoinnista, kerrotaan tarkemmin{' '}
          <TextLink {...args} size="p1" openExternal href="https://tampere.fi">
            Tampere.fi-sivustolla
          </TextLink>
          , jonne on koottu myös ohjeet oman aloitteen jättämiseen ja kaupungin päätöksenteon
          seuraamiseen.
        </Typography>
        <Typography variant="p2">
          Tarkemmat ohjeet lomakkeiden täyttämiseen, liitteiden lisäämiseen ja hakemuksen tilan
          seurantaan löydät kaupungin{' '}
          <TextLink {...args} size="p2" openExternal href="https://tampere.fi/asiointi">
            asiointipalvelusta
          </TextLink>
          , jonka kautta hoidat suurimman osan asioinneista ilman erillistä käyntiä virastossa.
        </Typography>
        <Typography variant="caption">
          Palvelun käyttöehdot, tietosuojaseloste ja saavutettavuusseloste löytyvät
          kokonaisuudessaan{' '}
          <TextLink {...args} size="caption" openExternal href="https://tampere.fi/kayttoehdot">
            Tampere.fi-sivuilta
          </TextLink>
          , joilta löydät myös ohjeet mahdollisen saavutettavuuspalautteen jättämiseen.
        </Typography>
      </div>
      <Typography variant="p1">
        Jos olet jo aiemmin tutustunut palveluun ja täyttänyt tarvittavat esitiedot, voit jatkaa
        asiointia suoraan sieltä, mistä jäit, tai{' '}
        <TextLink {...args} size="p1" visited href="#palvelu">
          palaa palvelun etusivulle
        </TextLink>{' '}
        nähdäksesi kaikki saatavilla olevat vaihtoehdot ja aloittaaksesi uuden asian käsittelyn
        alusta.
      </Typography>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Every link's size must match its surrounding paragraph's typography
    // scale, across both regular and external links, at every body-copy size.
    const regularLinkNames = [
      'verkkosivuiltamme',
      'varata ajan neuvontapalveluun',
      'usein kysytyt kysymykset',
    ];
    for (const name of regularLinkNames) {
      const link = canvas.getByRole('link', { name });
      const paragraph = link.closest('p');
      await expect(paragraph).not.toBeNull();
      await expect(getComputedStyle(link).fontSize).toBe(getComputedStyle(paragraph!).fontSize);
    }

    const externalLinkNames = [
      'Tampere.fi-sivustolla',
      'asiointipalvelusta',
      'Tampere.fi-sivuilta',
    ];
    for (const name of externalLinkNames) {
      const link = canvas.getByRole('link', { name: new RegExp(`^${name}`) });
      await expect(link).toHaveAttribute('target', '_blank');
      await expect(link.querySelector('svg')).not.toBeNull();
      const paragraph = link.closest('p');
      await expect(paragraph).not.toBeNull();
      await expect(getComputedStyle(link).fontSize).toBe(getComputedStyle(paragraph!).fontSize);
    }

    const visitedLink = canvas.getByRole('link', { name: 'palaa palvelun etusivulle' });
    // states.visited — see theme.ts for the WCAG AA contrast rationale.
    await expect(getComputedStyle(visitedLink).color).toBe('rgb(23, 47, 90)');
  },
};

// ── Test-only specs (hidden from sidebar/autodocs, still run as browser tests) ─

export const FocusVisible: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Tekstilinkki' });
    (link as HTMLAnchorElement).focus();
    const style = getComputedStyle(link);
    // Figma "Focus, unvisited" = primary-states/focus = #29549a = states.focus
    await expect(style.color).toBe('rgb(41, 84, 154)');
    await expect(style.textDecorationLine).toBe('underline');
    await expect(style.outlineStyle).toBe('solid');
  },
};

// ── Dev-warning tests (verifies the console.error guards in TextLink.tsx) ────

// Captures console.error calls for the dev-warning tests below.
let capturedConsoleErrors: string[] = [];

const captureConsoleErrors = () => {
  capturedConsoleErrors = [];
  const original = console.error;
  console.error = (...messageArgs: unknown[]) => {
    capturedConsoleErrors.push(String(messageArgs[0]));
  };
  return () => {
    console.error = original;
  };
};

export const WarnsWithoutDestination: Story = {
  // Neither `href` nor `renderLink` given — the link has no destination.
  args: { href: undefined },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(
        capturedConsoleErrors.some((m) => /provide either `href` or `renderLink`/.test(m))
      ).toBe(true)
    );
  },
};

export const WarnsWhenHrefIgnoredByRenderLink: Story = {
  // Both `href` and `renderLink` given — `href` is silently dropped.
  render: (args) => (
    <TextLink
      {...args}
      renderLink={(className) => (
        <a href="#custom" className={className}>
          Custom link component
        </a>
      )}
    />
  ),
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /`href` is ignored/.test(m))).toBe(true)
    );
  },
};

export const WarnsWhenOpenExternalIgnoredByRenderLink: Story = {
  // `openExternal` + `renderLink` given — target/rel/icon are silently dropped.
  args: { openExternal: true },
  render: (args) => (
    <TextLink
      {...args}
      renderLink={(className) => (
        <a href="#custom" className={className}>
          Custom link component
        </a>
      )}
    />
  ),
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /`openExternal` has no effect/.test(m))).toBe(true)
    );
  },
};
