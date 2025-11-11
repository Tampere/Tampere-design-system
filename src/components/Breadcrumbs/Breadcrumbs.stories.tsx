import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs, type Breadcrumb } from "./Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Breadcrumbs",
  component: Breadcrumbs,
};
export default meta;

type Story = StoryObj<typeof Breadcrumbs>;

function Link({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a className={className} href="/">
      {children}
    </a>
  );
}

const items: Breadcrumb[] = [
  { label: "Home", linkComponent: (props) => <Link {...props} /> },
  { label: "Library (default)", href: "/" },
  {
    label: "Data (default)",
    href: "/",
    linkComponent: (props) => <Link {...props} />,
  },
  {
    label: "Previous",
    href: "/",
    linkComponent: (props) => <Link {...props} />,
  },
  { label: "current" },
];

export const Default: Story = {
  args: {
    items,
  },
};
