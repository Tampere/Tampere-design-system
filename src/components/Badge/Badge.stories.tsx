import type { Meta, StoryObj } from '@storybook/react-vite';
import { within } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { StarFilledIcon } from '../../icons/StarFilledIcon';
import { InfoIcon } from '../../icons/InfoIcon';
import { AiIcon } from '../../icons/AiIcon';
import { Badge } from './Badge';

const meta = {
  component: Badge,
  tags: ['!dev', '!autodocs'],
  args: { children: 'Leima' },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

// ── Documentation examples (visible in sidebar + autodocs) ───────────────────

export const Neutral: Story = {
  tags: docExample,
  render: () => <Badge>Leima</Badge>,
};

export const Info: Story = {
  tags: docExample,
  render: () => <Badge status="info">Tiedote</Badge>,
};

export const Success: Story = {
  tags: docExample,
  render: () => <Badge status="success">Valmis</Badge>,
};

export const Warning: Story = {
  tags: docExample,
  render: () => <Badge status="warning">Huomio</Badge>,
};

export const Error: Story = {
  tags: docExample,
  render: () => <Badge status="error">Virhe</Badge>,
};

export const WithIcon: Story = {
  tags: docExample,
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Badge icon={<InfoIcon />}>Neutraali</Badge>
      <Badge status="info" showIcon>
        Tiedote
      </Badge>
      <Badge status="warning" showIcon>
        Huomio
      </Badge>
      <Badge status="success" showIcon>
        Valmis
      </Badge>
      <Badge status="error" showIcon>
        Virhe
      </Badge>
    </div>
  ),
};

// Split's #72 body — a badge conveying AI involvement, using the Neutral
// variant's custom-icon slot with `AiIcon` rather than a `status`, since
// "used/edited/created by AI" isn't a severity level.
export const AiBadgeExamples: Story = {
  name: 'AI Badge Examples',
  tags: docExample,
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 40 }}>
      <Badge icon={<AiIcon />}>Käyttää tekoälyä</Badge>
      <Badge icon={<AiIcon />}>Muokattu tekoälyllä</Badge>
      <Badge icon={<AiIcon />}>Luotu tekoälyllä</Badge>
    </div>
  ),
};

// ── Test-only specs (hidden from sidebar/autodocs, still run as browser tests) ─

export const NoIconByDefault: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <div data-testid="neutral-wrapper">
        <Badge>Leima</Badge>
      </div>
      <div data-testid="error-wrapper">
        <Badge status="error">Virhe</Badge>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('neutral-wrapper').querySelector('svg')).toBeNull();
    await expect(canvas.getByTestId('error-wrapper').querySelector('svg')).toBeNull();
  },
};

export const NeutralAcceptsCustomIcon: Story = {
  render: () => <Badge icon={<StarFilledIcon data-testid="custom-icon" />}>Suosikki</Badge>,
  play: async ({ canvasElement }) => {
    await expect(canvasElement.querySelector('[data-testid="custom-icon"]')).not.toBeNull();
  },
};

export const StatusIconTogglesFixedGlyph: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <div data-testid="info-wrapper">
        <Badge status="info" showIcon>
          Tiedote
        </Badge>
      </div>
      <div data-testid="success-wrapper">
        <Badge status="success" showIcon>
          Valmis
        </Badge>
      </div>
      <div data-testid="warning-wrapper">
        <Badge status="warning" showIcon>
          Huomio
        </Badge>
      </div>
      <div data-testid="error-wrapper">
        <Badge status="error" showIcon>
          Virhe
        </Badge>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('info-wrapper').querySelector('svg')).not.toBeNull();
    await expect(canvas.getByTestId('success-wrapper').querySelector('svg')).not.toBeNull();
    await expect(canvas.getByTestId('warning-wrapper').querySelector('svg')).not.toBeNull();
    await expect(canvas.getByTestId('error-wrapper').querySelector('svg')).not.toBeNull();
  },
};

export const StatusColors: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <Badge data-testid="neutral">Leima</Badge>
      <Badge status="info" data-testid="info">
        Tiedote
      </Badge>
      <Badge status="success" data-testid="success">
        Valmis
      </Badge>
      <Badge status="warning" data-testid="warning">
        Huomio
      </Badge>
      <Badge status="error" data-testid="error">
        Virhe
      </Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const neutral = canvas.getByText('Leima');
    const info = canvas.getByText('Tiedote');
    const success = canvas.getByText('Valmis');
    const warning = canvas.getByText('Huomio');
    const error = canvas.getByText('Virhe');

    await expect(getComputedStyle(neutral).backgroundColor).toBe('rgb(241, 238, 235)');
    await expect(getComputedStyle(neutral).color).toBe('rgb(45, 45, 50)');

    await expect(getComputedStyle(info).backgroundColor).toBe('rgb(41, 84, 154)');
    await expect(getComputedStyle(info).color).toBe('rgb(255, 255, 255)');

    await expect(getComputedStyle(success).backgroundColor).toBe('rgb(56, 111, 73)');
    await expect(getComputedStyle(success).color).toBe('rgb(255, 255, 255)');

    await expect(getComputedStyle(warning).backgroundColor).toBe('rgb(244, 210, 64)');
    await expect(getComputedStyle(warning).color).toBe('rgb(45, 45, 50)');

    await expect(getComputedStyle(error).backgroundColor).toBe('rgb(174, 30, 32)');
    await expect(getComputedStyle(error).color).toBe('rgb(255, 255, 255)');
  },
};

export const IsFullyRounded: Story = {
  render: () => <Badge>Leima</Badge>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByText('Leima');
    // The pill token (9999px), not Chip's own 20px radius.
    await expect(getComputedStyle(root).borderRadius).toBe('9999px');
  },
};

export const HeightTracksLabelFontSize: Story = {
  render: () => <Badge>Leima</Badge>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const root = canvas.getByText('Leima');
    const style = getComputedStyle(root);
    const fontSize = parseFloat(style.fontSize);
    const height = parseFloat(style.height);
    await expect(height).toBeCloseTo(2 * 4 + fontSize * 1.5, 0);
  },
};

export const IconMatchesIconSizeToken: Story = {
  render: () => <Badge icon={<StarFilledIcon />}>Suosikki</Badge>,
  play: async ({ canvasElement }) => {
    const icon = canvasElement.querySelector('svg');
    await expect(icon).not.toBeNull();
    const style = getComputedStyle(icon!);
    await expect(style.width).toBe('18px');
    await expect(style.height).toBe('18px');
  },
};

export const ClassNameLandsOnRoot: Story = {
  render: () => <Badge className="custom-badge">Leima</Badge>,
  play: async ({ canvasElement }) => {
    const root = canvasElement.querySelector('.custom-badge');
    await expect(root).not.toBeNull();
    await expect(root?.textContent).toContain('Leima');
  },
};

export const WarningAndErrorUseDistinctGlyphs: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16 }}>
      <div data-testid="warning-wrapper">
        <Badge status="warning" showIcon>
          Huomio
        </Badge>
      </div>
      <div data-testid="error-wrapper">
        <Badge status="error" showIcon>
          Virhe
        </Badge>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const warning = canvas.getByTestId('warning-wrapper').querySelector('svg');
    const error = canvas.getByTestId('error-wrapper').querySelector('svg');
    await expect(warning).not.toBeNull();
    await expect(error).not.toBeNull();
    await expect(warning!.innerHTML).not.toBe(error!.innerHTML);
    // Status must not be signalled to sighted users by fill colour alone.
    await expect(warning!.getAttribute('aria-hidden')).toBe('true');
    await expect(error!.getAttribute('aria-hidden')).toBe('true');
  },
};

export const LongLabelStaysOnOneLine: Story = {
  render: () => (
    <div style={{ width: 160 }} data-testid="narrow">
      <Badge data-testid="badge">Muokattu tekoälyllä</Badge>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const badge = canvas.getByTestId('badge');
    // The label must not wrap out of the fixed-height pill background.
    await expect(badge.scrollHeight).toBeLessThanOrEqual(badge.clientHeight);
  },
};
