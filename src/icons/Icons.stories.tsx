import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SVGProps, ComponentType } from 'react';
import { AddIcon } from './AddIcon';
import { AirplaneIcon } from './AirplaneIcon';
import { ArrowDownIcon } from './ArrowDownIcon';
import { ArrowLeftIcon } from './ArrowLeftIcon';
import { ArrowRightIcon } from './ArrowRightIcon';
import { ArrowUpIcon } from './ArrowUpIcon';
import { BarChartIcon } from './BarChartIcon';
import { BikeIcon } from './BikeIcon';
import { BlueskyIcon } from './BlueskyIcon';
import { BusIcon } from './BusIcon';
import { CalendarIcon } from './CalendarIcon';
import { CartAddIcon } from './CartAddIcon';
import { CartIcon } from './CartIcon';
import { CartRemoveIcon } from './CartRemoveIcon';
import { CheckboxCheckedIcon } from './CheckboxCheckedIcon';
import { CheckboxIndeterminateIcon } from './CheckboxIndeterminateIcon';
import { CheckboxUncheckedIcon } from './CheckboxUncheckedIcon';
import { ChevronDownIcon } from './ChevronDownIcon';
import { ChevronLeftIcon } from './ChevronLeftIcon';
import { ChevronRightIcon } from './ChevronRightIcon';
import { ChevronUpIcon } from './ChevronUpIcon';
import { CloseIcon } from './CloseIcon';
import { CreditCardIcon } from './CreditCardIcon';
import { DateTimeIcon } from './DateTimeIcon';
import { DownloadIcon } from './DownloadIcon';
import { EditIcon } from './EditIcon';
import { EnlargeIcon } from './EnlargeIcon';
import { EuroIcon } from './EuroIcon';
import { FavouritesFilledIcon } from './FavouritesFilledIcon';
import { FavouritesOutlinedIcon } from './FavouritesOutlinedIcon';
import { FacebookIcon } from './FacebookIcon';
import { FeedbackIcon } from './FeedbackIcon';
import { FileIcon } from './FileIcon';
import { FilterIcon } from './FilterIcon';
import { FirstPageIcon } from './FirstPageIcon';
import { HelpIcon } from './HelpIcon';
import { HomeIcon } from './HomeIcon';
import { InfoIcon } from './InfoIcon';
import { InstagramIcon } from './InstagramIcon';
import { LastPageIcon } from './LastPageIcon';
import { LanguageIcon } from './LanguageIcon';
import { LibraryIcon } from './LibraryIcon';
import { LinkedInIcon } from './LinkedInIcon';
import { ListIcon } from './ListIcon';
import { LocationIcon } from './LocationIcon';
import { LockIcon } from './LockIcon';
import { LoginIcon } from './LoginIcon';
import { LogoutIcon } from './LogoutIcon';
import { MailIcon } from './MailIcon';
import { MapIcon } from './MapIcon';
import { MenuIcon } from './MenuIcon';
import { MessageIcon } from './MessageIcon';
import { OpenExternalLinkIcon } from './OpenExternalLinkIcon';
import { ParkingIcon } from './ParkingIcon';
import { PathGuideIcon } from './PathGuideIcon';
import { PhoneIcon } from './PhoneIcon';
import { QrCodeIcon } from './QrCodeIcon';
import { RadioCheckedIcon } from './RadioCheckedIcon';
import { RadioUncheckedIcon } from './RadioUncheckedIcon';
import { ReadspeakerIcon } from './ReadspeakerIcon';
import { RecycleIcon } from './RecycleIcon';
import { RefreshIcon } from './RefreshIcon';
import { RemoveIcon } from './RemoveIcon';
import { ReorderIcon } from './ReorderIcon';
import { SearchIcon } from './SearchIcon';
import { SettingsIcon } from './SettingsIcon';
import { ShortcutLinkIcon } from './ShortcutLinkIcon';
import { StarFilledIcon } from './StarFilledIcon';
import { StarOutlinedIcon } from './StarOutlinedIcon';
import { StepCheckIcon } from './StepCheckIcon';
import { SwitchUncheckedIcon } from './SwitchUncheckedIcon';
import { TaxiIcon } from './TaxiIcon';
import { TikTokIcon } from './TikTokIcon';
import { TimeIcon } from './TimeIcon';
import { TrainIcon } from './TrainIcon';
import { TrashcanIcon } from './TrashcanIcon';
import { UploadIcon } from './UploadIcon';
import { UserAuthenticateIcon } from './UserAuthenticateIcon';
import { UserIcon } from './UserIcon';
import { UserRoleIcon } from './UserRoleIcon';
import { WarningIcon } from './WarningIcon';
import { XIcon } from './XIcon';
import { YouTubeIcon } from './YouTubeIcon';

const meta = {
  title: 'Icon library',
} satisfies Meta<{}>;

export default meta;
type Story = StoryObj<typeof meta>;

const icons: {
  name: string;
  Component: ComponentType<SVGProps<SVGSVGElement>>;
  props?: Record<string, unknown>;
}[] = [
  { name: 'Add', Component: AddIcon },
  { name: 'Airplane', Component: AirplaneIcon },
  { name: 'ArrowDown', Component: ArrowDownIcon },
  { name: 'ArrowLeft', Component: ArrowLeftIcon },
  { name: 'ArrowRight', Component: ArrowRightIcon },
  { name: 'ArrowUp', Component: ArrowUpIcon },
  { name: 'BarChart', Component: BarChartIcon },
  { name: 'Bike', Component: BikeIcon },
  { name: 'Bluesky', Component: BlueskyIcon },
  { name: 'Bus', Component: BusIcon },
  { name: 'Calendar', Component: CalendarIcon },
  { name: 'CartAdd', Component: CartAddIcon },
  { name: 'Cart', Component: CartIcon },
  { name: 'CartRemove', Component: CartRemoveIcon },
  { name: 'CheckboxChecked', Component: CheckboxCheckedIcon },
  { name: 'CheckboxIndeterminate', Component: CheckboxIndeterminateIcon },
  { name: 'CheckboxUnchecked', Component: CheckboxUncheckedIcon },
  { name: 'ChevronDown', Component: ChevronDownIcon },
  { name: 'ChevronLeft', Component: ChevronLeftIcon },
  { name: 'ChevronRight', Component: ChevronRightIcon },
  { name: 'ChevronUp', Component: ChevronUpIcon },
  { name: 'Close', Component: CloseIcon },
  { name: 'CreditCard', Component: CreditCardIcon },
  { name: 'DateTime', Component: DateTimeIcon },
  { name: 'Download', Component: DownloadIcon },
  { name: 'Edit', Component: EditIcon },
  { name: 'Enlarge', Component: EnlargeIcon },
  { name: 'Euro', Component: EuroIcon },
  { name: 'FavouritesFilled', Component: FavouritesFilledIcon },
  { name: 'FavouritesOutlined', Component: FavouritesOutlinedIcon },
  { name: 'Facebook', Component: FacebookIcon },
  { name: 'Feedback', Component: FeedbackIcon },
  { name: 'File', Component: FileIcon },
  { name: 'Filter', Component: FilterIcon },
  { name: 'FirstPage', Component: FirstPageIcon },
  { name: 'Help', Component: HelpIcon },
  { name: 'Home', Component: HomeIcon },
  { name: 'Info', Component: InfoIcon },
  { name: 'Instagram', Component: InstagramIcon },
  { name: 'LastPage', Component: LastPageIcon },
  { name: 'Language', Component: LanguageIcon },
  { name: 'Library', Component: LibraryIcon },
  { name: 'LinkedIn', Component: LinkedInIcon },
  { name: 'List', Component: ListIcon },
  { name: 'Location', Component: LocationIcon },
  { name: 'Lock', Component: LockIcon },
  { name: 'Login', Component: LoginIcon },
  { name: 'Logout', Component: LogoutIcon },
  { name: 'Mail', Component: MailIcon },
  { name: 'Map', Component: MapIcon },
  { name: 'Menu', Component: MenuIcon },
  { name: 'Message', Component: MessageIcon },
  { name: 'OpenExternalLink', Component: OpenExternalLinkIcon },
  { name: 'Parking', Component: ParkingIcon },
  { name: 'PathGuide', Component: PathGuideIcon },
  { name: 'Phone', Component: PhoneIcon },
  { name: 'QrCode', Component: QrCodeIcon },
  { name: 'RadioChecked', Component: RadioCheckedIcon },
  { name: 'RadioUnchecked', Component: RadioUncheckedIcon },
  { name: 'Readspeaker', Component: ReadspeakerIcon },
  { name: 'Recycle', Component: RecycleIcon },
  { name: 'Refresh', Component: RefreshIcon },
  { name: 'Remove', Component: RemoveIcon },
  { name: 'Reorder', Component: ReorderIcon },
  { name: 'Search', Component: SearchIcon },
  { name: 'Settings', Component: SettingsIcon },
  { name: 'ShortcutLink', Component: ShortcutLinkIcon },
  { name: 'StarFilled', Component: StarFilledIcon },
  { name: 'StarOutlined', Component: StarOutlinedIcon },
  { name: 'StepCheck', Component: StepCheckIcon },
  { name: 'SwitchUnchecked', Component: SwitchUncheckedIcon },
  { name: 'Taxi', Component: TaxiIcon },
  { name: 'TikTok', Component: TikTokIcon },
  { name: 'Time', Component: TimeIcon },
  { name: 'Train', Component: TrainIcon },
  { name: 'Trashcan', Component: TrashcanIcon },
  { name: 'Upload', Component: UploadIcon },
  { name: 'UserAuthenticate', Component: UserAuthenticateIcon },
  { name: 'User', Component: UserIcon },
  { name: 'UserRole', Component: UserRoleIcon },
  { name: 'Warning', Component: WarningIcon },
  { name: 'X', Component: XIcon },
  { name: 'YouTube', Component: YouTubeIcon },
];

export const AllIcons: Story = {
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
