import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { TampereLogo } from './TampereLogo';
import { TampereVaakuna } from './TampereVaakuna';
import { TampereVaakunaWhite } from './TampereVaakunaWhite';

const meta = {
  title: 'Logos',
} satisfies Meta<{}>;

export default meta;
type Story = StoryObj<typeof meta>;

const Logos: { name: string; Component: any; props?: Record<string, unknown> }[] = [
  { name: 'TampereLogo', Component: TampereLogo },
  { name: 'TampereVaakuna', Component: TampereVaakuna },
  { name: 'TampereVaakunaWhite', Component: TampereVaakunaWhite },
];

export const All: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <h2>Logos</h2>
      <div
        style={{
          display: 'grid',
          gap: 16,
          alignItems: 'center',
        }}
      >
        {Logos.map(({ name, Component, props }) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
              padding: 8,
            }}
          >
            <div
              style={{
                height: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Component {...(props || {})} />
            </div>
            <div style={{ fontSize: 12, textAlign: 'center', wordBreak: 'break-word' }}>{name}</div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const VaakunaAcceptsClassName: Story = {
  render: () => <TampereVaakuna className="probe-class" />,
  play: async ({ canvasElement }) => {
    // The header sizes the vaakuna from a per-breakpoint token, which needs a
    // class on the svg itself — the hardcoded width/height attributes can't
    // respond to the breakpoint.
    await expect(canvasElement.querySelector('svg.probe-class')).not.toBeNull();
  },
  tags: ['!dev', '!autodocs'],
};

export const TampereLogoViewBoxIsCroppedToInk: Story = {
  // A Figma re-export can silently reintroduce the original 0-origin viewBox
  // (see TampereLogo.tsx's own comment: it renders at 58% of any CSS height
  // if that happens) — pinning the cropped value so a regression is caught
  // immediately instead of by visual review.
  render: () => <TampereLogo />,
  play: async ({ canvasElement }) => {
    const svg = canvasElement.querySelector('svg') as SVGElement;
    await expect(svg.getAttribute('viewBox')).toBe('0.600098 11 131.4 30');
  },
  tags: ['!dev', '!autodocs'],
};
