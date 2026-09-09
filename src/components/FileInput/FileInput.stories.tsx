import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
import { expect, fireEvent, fn } from 'storybook/test';
import { FileInput } from './FileInput';

const makeFile = (name: string, type = 'application/pdf', size = 1024) =>
  new File(['x'.repeat(size)], name, { type, lastModified: 1 });

/**
 * The hidden native input Mantine's `FileButton` renders. It is
 * `display:none` and never focusable — the visible `Button` (wired via
 * `aria-labelledby`/`aria-describedby`, see FileInput.tsx) is the real
 * keyboard/focus/AT path. This is only the target `userEvent.upload`/
 * `injectFiles` deliver files to, simulating what the picker dialog hands
 * back once the Button has triggered it.
 */
const hiddenInput = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLInputElement>('input[type="file"]')!;

/**
 * Delivers files to the hidden input the way a drop or a permissive OS dialog
 * would, bypassing `userEvent.upload`'s own `accept`-attribute filtering (it
 * mimics a restrictive file dialog and silently drops non-matching files
 * before they ever reach `onChange`). Use this when the story's whole point
 * is to exercise our own `useFileSelection` validation on a file that made it
 * through — the native `accept` attribute is the picker's filter, not ours.
 */
const injectFiles = (input: HTMLInputElement, files: File[]) => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  fireEvent.change(input, { target: { files: dataTransfer.files } });
};

const meta = {
  component: FileInput,
  tags: ['!dev', '!autodocs'],
  args: {
    inputLabel: 'Liitetiedostot',
    'data-testid': 'file-input',
  },
} satisfies Meta<typeof FileInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Liitetiedostot')).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', { name: 'Liitetiedostot Valitse tiedostoja' })
    ).toBeInTheDocument();
    await expect(canvas.getByText('Ei valittua tiedostoa')).toBeInTheDocument();

    // The native input exists to receive picked files but is display:none;
    // it's asserted present only as a sanity check that FileButton rendered.
    await expect(hiddenInput(canvasElement)).toBeInTheDocument();
  },
};

export const WithHelperText: Story = {
  tags: docExample,
  args: { helperText: 'Sallitut muodot: PDF' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helper = canvas.getByText('Sallitut muodot: PDF');
    await expect(helper).toBeInTheDocument();

    // Mantine renders the helper text as a `<p>`, and `unstyled` drops the
    // class that zeroes its UA `1em 0` margin — which stacked ~18px on top of
    // the root's 8px gap on both sides (Figma 6817:11131 draws 8px flat).
    // Margins don't collapse in a flex column, so this has to be asserted on
    // the element itself; the gap token alone can't keep the spacing honest.
    await expect(getComputedStyle(helper).marginTop).toBe('0px');
    await expect(getComputedStyle(helper).marginBottom).toBe('0px');
  },
};

export const Error: Story = {
  tags: docExample,
  args: { error: 'Kuvaava virheviesti' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const message = canvas.getByText('Kuvaava virheviesti');
    const labelEl = canvas.getByText('Liitetiedostot');
    const statusEl = canvas.getByRole('status');

    // Figma Common/Error = Red/300 (#ae1e20). Checked on the label and the
    // display's border too, not just the message — those are the
    // status-keyed (`label[status]`/`display[status]`) styles; asserting
    // only the message (which isn't status-keyed) wouldn't catch either
    // being dropped.
    await expect(getComputedStyle(message).color).toBe('rgb(174, 30, 32)');
    await expect(getComputedStyle(labelEl).color).toBe('rgb(174, 30, 32)');
    await expect(getComputedStyle(statusEl).borderColor).toBe('rgb(174, 30, 32)');
  },
};

export const Disabled: Story = {
  tags: docExample,
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(
      canvas.getByRole('button', { name: 'Liitetiedostot Valitse tiedostoja' })
    ).toBeDisabled();
    await expect(hiddenInput(canvasElement)).toBeDisabled();

    // Disabled is the one state where the seam has to be drawn: the button
    // takes the same `background.disabled` fill as the display beside it, so
    // without this left border the two halves render as one flat grey slab
    // (Figma 6747:9526 draws #c9c9ce on all four sides). The width is what
    // matters — `borderLeftColor` stays correct even when the border is off.
    const statusEl = canvas.getByRole('status');
    await expect(getComputedStyle(statusEl).borderLeftWidth).toBe('2px');
    await expect(getComputedStyle(statusEl).borderColor).toBe('rgb(201, 201, 206)');
    await expect(getComputedStyle(statusEl).backgroundColor).toBe('rgb(242, 242, 244)');
  },
};

export const Multiple: Story = {
  tags: docExample,
  args: { multiple: true, defaultValue: [makeFile('hakemus.pdf'), makeFile('liite.pdf')] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('2 tiedostoa valittu')).toBeInTheDocument();
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
  },
};

export const PickingAFileUpdatesStatusAndList: Story = {
  args: { onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await userEvent.upload(hiddenInput(canvasElement), makeFile('hakemus.pdf'));

    // The filename appears twice by design: in the status line (single-file
    // mode shows it directly, covering getStatusText's filename branch) and
    // in the removable row beneath.
    await expect(canvas.getByRole('status')).toHaveTextContent('hakemus.pdf');
    const row = canvas.getByRole('listitem');
    await expect(within(row).getByText('hakemus.pdf')).toBeInTheDocument();
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const RejectsWrongType: Story = {
  args: { accept: 'application/pdf', onReject: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // userEvent.upload honours the input's `accept` attribute and would drop
    // this file before our own validation saw it. The native attribute is
    // the picker's filter; useFileSelection is the authority. Inject
    // directly to test ours.
    injectFiles(hiddenInput(canvasElement), [makeFile('virus.exe', 'application/x-msdownload')]);

    await expect(canvas.getByText('Tiedostomuotoa ei tueta')).toBeInTheDocument();
    await expect(args.onReject).toHaveBeenCalled();
  },
};

export const RejectsOversizeFile: Story = {
  args: { maxSize: 512 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.upload(
      hiddenInput(canvasElement),
      makeFile('big.pdf', 'application/pdf', 2048)
    );

    await expect(canvas.getByText(/Tiedosto on liian suuri/)).toBeInTheDocument();
  },
};

export const ConsumerErrorWinsOverRejection: Story = {
  args: { accept: 'application/pdf', error: 'Lataus epäonnistui' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // accept is back on the native input (Ruling 1), so userEvent.upload
    // would silently drop this file before validation ever ran, making the
    // story pass for the wrong reason (no rejection produced at all, rather
    // than a rejection genuinely being shadowed by the consumer error).
    // Inject directly so this exercises the real precedence.
    injectFiles(hiddenInput(canvasElement), [makeFile('virus.exe', 'application/x-msdownload')]);

    await expect(canvas.getByText('Lataus epäonnistui')).toBeInTheDocument();
    await expect(canvas.queryByText('Tiedostomuotoa ei tueta')).not.toBeInTheDocument();
  },
};

export const RemovingAFileClearsStatus: Story = {
  args: { multiple: true, defaultValue: [makeFile('hakemus.pdf')] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'Poista tiedosto: hakemus.pdf' }));

    await expect(canvas.getByText('Ei valittua tiedostoa')).toBeInTheDocument();
    await expect(canvas.queryByRole('listitem')).not.toBeInTheDocument();
  },
};

export const RemovingTheFileInSingleFileModeClearsStatus: Story = {
  args: { defaultValue: [makeFile('hakemus.pdf')] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // In single-file mode the status line has no remove affordance of its
    // own — the row's ✕ is the only way to clear the selection.
    await userEvent.click(canvas.getByRole('button', { name: 'Poista tiedosto: hakemus.pdf' }));

    await expect(canvas.getByText('Ei valittua tiedostoa')).toBeInTheDocument();
    await expect(canvas.queryByRole('listitem')).not.toBeInTheDocument();
  },
};

export const LabeledIsAssociatedAndErrorIsDescribed: Story = {
  args: { error: 'Kuvaava virheviesti', helperText: 'Ohjeteksti' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Input.Wrapper's own describedBy/aria-invalid wiring only reaches
    // Mantine `Input` descendants via context — our composed control (a
    // div/span/Button) doesn't consume it, so FileInput wires the picker
    // Button explicitly instead. Assert the wiring itself, not just that the
    // label/helper/error text happens to render somewhere on the page.
    const button = canvas.getByRole('button', { name: 'Liitetiedostot Valitse tiedostoja' });
    await expect(button).toBeInTheDocument();

    const describedByIds = button.getAttribute('aria-describedby')?.split(' ') ?? [];
    await expect(describedByIds.length).toBeGreaterThan(0);
    const describedText = describedByIds
      .map((id) => canvasElement.querySelector(`[id="${id}"]`)?.textContent ?? '')
      .join(' ');
    await expect(describedText).toContain('Ohjeteksti');
    await expect(describedText).toContain('Kuvaava virheviesti');

    await expect(button).toHaveAttribute('aria-invalid', 'true');

    // The whole reason the Button carries its own `id` (fieldId) is so
    // Input.Wrapper's label `for` — which it always points at fieldId —
    // actually lands on something. Assert the association itself, not just
    // that both elements happen to exist.
    const labelEl = canvas.getByText('Liitetiedostot');
    await expect(labelEl.getAttribute('for')).toBe(button.getAttribute('id'));
  },
};

export const AriaLabelSubstitutesForMissingInputLabel: Story = {
  args: { inputLabel: undefined, 'aria-label': 'Liitteet' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // No `inputLabel` means Input.Wrapper renders no `<label>` at all, so
    // the only way for the consumer's `aria-label` to reach an actual
    // accessible name is via the visually-hidden span FileInput.tsx wires
    // into the Button's own aria-labelledby. Query by the resulting
    // accessible name itself — the same empirical standard the
    // aria-labelledby ordering question was settled with earlier — rather
    // than trusting that wiring the attribute was enough.
    const button = canvas.getByRole('button', { name: 'Liitteet Valitse tiedostoja' });
    await expect(button).toBeInTheDocument();

    // The button's own visible text must survive alongside the consumer's
    // label, not be replaced by it.
    await expect(canvas.getByText('Valitse tiedostoja')).toBeInTheDocument();

    // And the wrapper `<div>` (role-less, so aria-label on it would be
    // inert anyway) must not carry the attribute — it should have been
    // pulled out of the spread and consumed deliberately, not left inert.
    await expect(canvas.getByTestId('file-input')).not.toHaveAttribute('aria-label');
  },
};

export const LongFilenameTruncatesWithEllipsis: Story = {
  args: { defaultValue: [makeFile(`${'a'.repeat(200)}.pdf`)] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const wrapper = canvas.getByTestId('file-input');
    const status = canvas.getByRole('status');
    const textEl = status.querySelector('span')!;

    // The status box must not grow past the field — a long filename
    // truncates instead of pushing the layout wider.
    await expect(status.getBoundingClientRect().right).toBeLessThanOrEqual(
      wrapper.getBoundingClientRect().right + 1
    );
    // And the truncation is real (the text is actually clipped), not just
    // decorative CSS that never engages — `text-overflow` has no effect on
    // the flex container itself, only on this block-level child.
    await expect(textEl.scrollWidth).toBeGreaterThan(textEl.clientWidth);
  },
};

export const ReselectingTheSameFileAfterRemovalReappears: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const file = makeFile('hakemus.pdf');

    await userEvent.upload(hiddenInput(canvasElement), file);
    await expect(canvas.getByRole('status')).toHaveTextContent('hakemus.pdf');

    await userEvent.click(canvas.getByRole('button', { name: 'Poista tiedosto: hakemus.pdf' }));
    await expect(canvas.getByText('Ei valittua tiedostoa')).toBeInTheDocument();

    // Re-picking the exact same File object: without resetting the native
    // input's value after the first pick, browsers don't fire `change` again
    // for a FileList identical to the input's current one, so the file would
    // silently fail to come back.
    await userEvent.upload(hiddenInput(canvasElement), file);
    await expect(canvas.getByRole('status')).toHaveTextContent('hakemus.pdf');
  },
};
