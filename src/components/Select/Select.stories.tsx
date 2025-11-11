import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "src/components";

const meta = {
  component: Select,
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    inputLabel: "Hedelmävalinta",
    placeholder: "Valitse hedelmä...",
    options: ["Omena", "Banaani", "Appelsiini", "Mango"],
    required: false,
    error: "",
    disabled: false,
    helperText: "Ohjeteksti tähän",
  },
  render: (args) => <Select {...args} />,
};
