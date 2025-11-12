import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeftIcon } from './ArrowLeftIcon';
import { ArrowRightIcon } from './ArrowRightIcon';
import { BuildingIcon } from './BuildingIcon';
import { CartAddIcon } from './CartAddIcon';
import { CartIcon } from './CartIcon';
import { CartRemoveIcon } from './CartRemoveIcon';
import { CheckboxCheckedIcon } from './CheckboxCheckedIcon';
import { CheckboxUncheckedIcon } from './CheckboxUncheckedIcon';
import { ChevronDownIcon } from './ChevronDownIcon';
import { CrossIcon } from './CrossIcon';
import { DocumentCountIcon } from './DocumentCountIcon';
import { DocumentSearchIcon } from './DocumentSearchIcon';
import { DownloadIcon } from './DownloadIcon';
import { IconChevronLeft } from './IconChevronLeft';
import { IconChevronRight } from './IconChevronRight';
import { MagnifierIcon } from './MagnifierIcon';
import { MapIcon } from './MapIcon';
import { MenuIcon } from './MenuIcon';
import { OpenExternalLinkIcon } from './OpenExternalLinkIcon';
import { PaymentIcon } from './PaymentIcon';
import { SettingsIcon } from './SettingsIcon';
import { TrashcanIcon } from './TrashcanIcon';
import { UserAuthenticateIcon } from './UserAuthenticateIcon';
import { UserIcon } from './UserIcon';
import { ZoomInIcon } from './ZoomInIcon';
import { ZoomOutIcon } from './ZoomOutIcon';

const meta = {
  title: 'Icon library',
} satisfies Meta<{}>;

export default meta;
type Story = StoryObj<typeof meta>;

const icons: { name: string; Component: any; props?: Record<string, unknown> }[] = [
  { name: 'ArrowLeftIcon', Component: ArrowLeftIcon },
  { name: 'ArrowRightIcon', Component: ArrowRightIcon },
  { name: 'BuildingIcon', Component: BuildingIcon },
  { name: 'CartAddIcon', Component: CartAddIcon },
  { name: 'CartIcon', Component: CartIcon },
  { name: 'CartRemoveIcon', Component: CartRemoveIcon },
  { name: 'CheckboxCheckedIcon', Component: CheckboxCheckedIcon },
  { name: 'CheckboxUncheckedIcon', Component: CheckboxUncheckedIcon },
  { name: 'ChevronDownIcon', Component: ChevronDownIcon },
  { name: 'CrossIcon', Component: CrossIcon },
  { name: 'DocumentCountIcon', Component: DocumentCountIcon, props: { count: 5 } },
  { name: 'DocumentSearchIcon', Component: DocumentSearchIcon },
  { name: 'DownloadIcon', Component: DownloadIcon },
  { name: 'IconChevronLeft', Component: IconChevronLeft },
  { name: 'IconChevronRight', Component: IconChevronRight },
  { name: 'MagnifierIcon', Component: MagnifierIcon },
  { name: 'MapIcon', Component: MapIcon },
  { name: 'MenuIcon', Component: MenuIcon },
  { name: 'OpenExternalLinkIcon', Component: OpenExternalLinkIcon },
  { name: 'PaymentIcon', Component: PaymentIcon },
  { name: 'SettingsIcon', Component: SettingsIcon },
  { name: 'TrashcanIcon', Component: TrashcanIcon },
  { name: 'UserAuthenticateIcon', Component: UserAuthenticateIcon },
  { name: 'UserIcon', Component: UserIcon },
  { name: 'ZoomInIcon', Component: ZoomInIcon },
  { name: 'ZoomOutIcon', Component: ZoomOutIcon },
];

export const All: Story = {
  render: () => (
    <div style={{ padding: 16 }}>
      <h2>Icon gallery</h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: 16,
          alignItems: 'center',
        }}
      >
        {icons.map(({ name, Component, props }) => (
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
                width: 48,
                height: 48,
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
