import { Stack } from '@mantine/core';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from './Table';
import { Pagination } from '../Pagination';
// react hooks not required here; story pagination state is managed via Storybook args
import { useArgs } from '@storybook/client-api';

const meta = {
  argTypes: {
    children: { control: 'text' },
  },
  args: {
    children: 'Table content',
  },
  component: Table,
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

const columns = [
  'Kellonaika',
  'Maanantai',
  'Tiistai',
  'Keskiviikko',
  'Torstai',
  'Perjantai',
  'Lauantai',
  'Sunnuntai',
];

const rows = [
  '09:00-11:00',
  '11:00-13:00',
  '13:00-16:00',
  '16:00-17:00',
  '17:00-18:00',
  '18:00-20:00',
  '20:00-22:00',
];

export const Primary: Story = {
  args: {},
  render: () => {
    const [storyArgs, updateArgs] = useArgs();
    const activePageIndex = storyArgs.activePageIndex ?? 0;
    const pageSize = 5; // Number of rows per page
    const pageCount = Math.ceil(rows.length / pageSize);

    const emptyRows =
      activePageIndex > 0 ? Math.max(0, (1 + activePageIndex) * pageSize - rows.length) : 0;

    return (
      <Stack style={{ overflow: 'auto' }}>
        <Table>
          <TableHeader title={'Viikkokalenteri'}>
            <TableRow>
              {columns.map((column, index) => (
                <TableHeaderCell key={index} scope={index === 0 ? 'row' : 'col'}>
                  {column}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows
              .slice(activePageIndex * pageSize, activePageIndex * pageSize + pageSize)
              .map((row, index) => (
                <TableRow key={activePageIndex * pageSize + index}>
                  <TableHeaderCell
                    style={{ width: 'fit-content', whiteSpace: 'nowrap' }}
                    scope="row"
                  >
                    {row}
                  </TableHeaderCell>
                  <TableCell>Vapaata</TableCell>
                  <TableCell>Vapaata</TableCell>
                  <TableCell>Varattu</TableCell>
                  <TableCell>Vapaata</TableCell>
                  <TableCell>Vapaata</TableCell>
                  <TableCell>Vapaata</TableCell>
                  <TableCell>Vapaata</TableCell>
                </TableRow>
              ))}
            {emptyRows > 0 && (
              <>
                <TableRow style={{ height: 54 * emptyRows }}>
                  <TableCell colSpan={rows.length + 1} />
                </TableRow>
              </>
            )}
          </TableBody>
        </Table>
        <TableFooter
          style={{
            justifyContent: 'center',
            position: 'sticky',
            bottom: 0,
            left: 0,
          }}
          variant="div"
          aria-label="Sivutus"
        >
          <Pagination
            leftButtonLabel="Edellinen"
            rightButtonLabel="Seuraava"
            pageCount={pageCount}
            activePageIndex={activePageIndex}
            getAriaLabelForButton={(index) => `Sivu ${String(index + 1)} / ${String(pageCount)}`}
            onPageChange={(newPage) => {
              updateArgs({ activePageIndex: newPage });
            }}
          />
        </TableFooter>
      </Stack>
    );
  },
};
