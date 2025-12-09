import type { Meta, StoryObj } from '@storybook/react-vite';
import { ArrowLeftIcon } from './ArrowLeftIcon';
import { ArrowRightIcon } from './ArrowRightIcon';
import { CartAddIcon } from './CartAddIcon';
import { CartIcon } from './CartIcon';
import { CartRemoveIcon } from './CartRemoveIcon';
import { CheckboxCheckedIcon } from './CheckboxCheckedIcon';
import { CheckboxUncheckedIcon } from './CheckboxUncheckedIcon';
import { ChevronDownIcon } from './ChevronDownIcon';
import { CloseIcon } from './CloseIcon';
import { DownloadIcon } from './DownloadIcon';
import { IconChevronLeft } from './ChevronLeftIcon';
import { IconChevronRight } from './ChevronRightIcon';
import { SearchIcon } from './SearchIcon';
import { MapIcon } from './MapIcon';
import { MenuIcon } from './MenuIcon';
import { OpenExternalLinkIcon } from './OpenExternalLinkIcon';
import { EuroIcon } from './EuroIcon';
import { SettingsIcon } from './SettingsIcon';
import { TrashcanIcon } from './TrashcanIcon';
import { UserAuthenticateIcon } from './UserAuthenticateIcon';
import { UserIcon } from './UserIcon';
import { AddIcon } from './AddIcon';
import { RemoveIcon } from './RemoveIcon';

const meta = {
  title: 'Icon library',
} satisfies Meta<{}>;

export default meta;
type Story = StoryObj<typeof meta>;

const icons: { name: string; Component: any; props?: Record<string, unknown> }[] = [
  { name: 'ArrowLeftIcon', Component: ArrowLeftIcon },
  { name: 'ArrowRightIcon', Component: ArrowRightIcon },
  { name: 'CartAddIcon', Component: CartAddIcon },
  { name: 'CartIcon', Component: CartIcon },
  { name: 'CartRemoveIcon', Component: CartRemoveIcon },
  { name: 'CheckboxCheckedIcon', Component: CheckboxCheckedIcon },
  { name: 'CheckboxUncheckedIcon', Component: CheckboxUncheckedIcon },
  { name: 'ChevronDownIcon', Component: ChevronDownIcon },
  { name: 'CrossIcon', Component: CloseIcon },
  { name: 'DownloadIcon', Component: DownloadIcon },
  { name: 'IconChevronLeft', Component: IconChevronLeft },
  { name: 'IconChevronRight', Component: IconChevronRight },
  { name: 'MagnifierIcon', Component: SearchIcon },
  { name: 'MapIcon', Component: MapIcon },
  { name: 'MenuIcon', Component: MenuIcon },
  { name: 'OpenExternalLinkIcon', Component: OpenExternalLinkIcon },
  { name: 'PaymentIcon', Component: EuroIcon },
  { name: 'SettingsIcon', Component: SettingsIcon },
  { name: 'TrashcanIcon', Component: TrashcanIcon },
  { name: 'UserAuthenticateIcon', Component: UserAuthenticateIcon },
  { name: 'UserIcon', Component: UserIcon },
  { name: 'ZoomInIcon', Component: AddIcon },
  { name: 'ZoomOutIcon', Component: RemoveIcon },
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
