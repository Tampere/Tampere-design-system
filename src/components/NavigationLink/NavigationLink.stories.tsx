import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavigationLink } from "./NavigationLink";
import { Flex, Stack } from "@mantine/core";

const meta = {
  component: NavigationLink,
  argTypes: {
    isSelected: {
      control: "boolean",
      description: "Whether the link is in a selected/active state",
    },
    href: {
      control: "text",
      description: "Link destination URL",
    },
  },
} satisfies Meta<typeof NavigationLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    href: "#",
    children: "Navigointilinkki",
    isSelected: false,
  },
};

export const Selected: Story = {
  args: {
    href: "#",
    children: "Navigointilinkki",
    isSelected: true,
  },
};

export const AllStates: Story = {
  render: () => (
    <Stack gap="lg">
      <Flex gap="xl">
        <Stack gap="md">
          <h3>Medium</h3>
          <NavigationLink href="#">Navigointilinkki</NavigationLink>
          <NavigationLink href="#" isSelected>
            Navigointilinkki
          </NavigationLink>
        </Stack>

        <Stack gap="md">
          <h3>Small</h3>
          <NavigationLink href="#" size="sm">
            Navigointilinkki
          </NavigationLink>
          <NavigationLink href="#" size="sm" isSelected>
            Navigointilinkki
          </NavigationLink>
        </Stack>
      </Flex>

      <div style={{ background: "#0056A6", padding: "20px" }}>
        <h3 style={{ color: "white" }}>Inverted Color</h3>
        <Flex gap="xl">
          <NavigationLink href="#" variant="inverted">
            Navigointilinkki
          </NavigationLink>
          <NavigationLink href="#" isSelected variant="inverted">
            Navigointilinkki
          </NavigationLink>
        </Flex>
      </div>
    </Stack>
  ),
};

export const WithCustomLink: Story = {
  render: () => (
    <Stack gap="md">
      <h3>With Custom Component as Link</h3>
      <NavigationLink
        renderLink={(className) => {
          return (
            <a href="#custom" className={className}>
              Custom Link Component
            </a>
          );
        }}
      />
      <NavigationLink
        isSelected
        renderLink={(className) => (
          <a href="#custom-selected" className={className}>
            Selected Custom Link
          </a>
        )}
      />
      <div style={{ background: "#0056A6", padding: "20px" }}>
        <NavigationLink
          variant="inverted"
          renderLink={(className) => {
            return (
              <a href="#custom-selected" className={className}>
                Inverted custom children
              </a>
            );
          }}
        ></NavigationLink>
      </div>
    </Stack>
  ),
};
