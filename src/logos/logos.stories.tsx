import type { Meta, StoryObj } from '@storybook/react-vite';
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
