import type { Meta, StoryObj } from '@storybook/react-vite';

import { Accordion, AccordionItem } from 'src/components';

const meta: Meta<typeof Accordion> = {
  title: 'Accordion',
  component: Accordion,
};
export default meta;
type Story = StoryObj<typeof Accordion>;

export const Primary: Story = {
  args: {
    spacing: 'default',
  },
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem openLabel="Avaa" closeLabel="Sulje" label={'Eka'} value={'Eka'}>
        <div>Lorem ipsum dolor sit amet, consectetur adipiscing</div>
      </AccordionItem>
      <AccordionItem disabled openLabel="Avaa" closeLabel="Sulje" label={'Toka'} value={'Toka'}>
        <div>Lorem ipsum dolor sit amet, consectetur adipiscing</div>
      </AccordionItem>
      <AccordionItem openLabel="Avaa" closeLabel="Sulje" label={'Kolmas'} value={'Kolmas'}>
        <div>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent elementum, lorem a
          rutrum consectetur, nisi nulla bibendum tortor, non viverra magna tellus ac magna. Fusce
          quis imperdiet nisl. Praesent in risus vel magna consequat tempor. Pellentesque a sapien
          sit amet mi feugiat vestibulum. Quisque euismod, nisl at luctus lacinia, velit nisi
          interdum libero, a ultrices ipsum nulla a felis. Curabitur sit amet augue vitae turpis
          efficitur consequat. Donec semper magna vel sem sollicitudin, auctor volutpat nulla
          faucibus. Integer accumsan felis at lacus sodales, eget feugiat lorem interdum. Sed
          laoreet, magna at malesuada pellentesque, justo libero placerat lorem, at gravida purus
          dui in nunc.
        </div>
      </AccordionItem>
    </Accordion>
  ),
};
