import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
import { expect, fn } from 'storybook/test';
import { FileList } from './FileList';
import {
  defaultSelectedCountLabel,
  deriveRejectionMessage,
  getStatusText,
  matchesAccept,
  toFileArray,
  useFileSelection,
  validateFiles,
  type UseFileSelectionOptions,
} from './fileSelection';

const makeFile = (name: string, type = 'application/pdf', size = 1024) =>
  new File(['x'.repeat(size)], name, { type, lastModified: 1 });

const meta = {
  component: FileList,
  tags: ['!dev', '!autodocs'],
  args: {
    files: [makeFile('hakemus.pdf'), makeFile('liite.pdf')],
    onRemove: fn(),
    'data-testid': 'file-list',
  },
} satisfies Meta<typeof FileList>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // One row per file, in a real list so screen readers announce the count.
    const list = canvas.getByTestId('file-list');
    await expect(list.tagName).toBe('UL');
    await expect(canvas.getAllByRole('listitem')).toHaveLength(2);
    await expect(canvas.getByText('hakemus.pdf')).toBeInTheDocument();

    // Each remove button names its own file, so the label isn't ambiguous
    // when several rows are present.
    await expect(
      canvas.getByRole('button', { name: 'Poista tiedosto: hakemus.pdf' })
    ).toBeInTheDocument();
  },
};

export const RemoveCallsHandlerWithIndex: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Poista tiedosto: liite.pdf' }));

    await expect(args.onRemove).toHaveBeenCalledWith(1);
  },
};

export const EmptyRendersNothing: Story = {
  args: { files: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByTestId('file-list')).not.toBeInTheDocument();
  },
};

export const Disabled: Story = {
  tags: docExample,
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const buttons = canvas.getAllByRole('button');

    for (const button of buttons) {
      await expect(button).toBeDisabled();
    }
  },
};

export const CustomRemoveLabel: Story = {
  args: { removeLabel: 'Remove file' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Remove file: hakemus.pdf' })
    ).toBeInTheDocument();
  },
};

export const ValidationRules: Story = {
  args: { files: [] },
  play: async () => {
    // --- matchesAccept: exact MIME, wildcard, extension, and no filter at all
    await expect(matchesAccept(makeFile('a.pdf', 'application/pdf'), undefined)).toBe(true);
    await expect(matchesAccept(makeFile('a.pdf', 'application/pdf'), 'application/pdf')).toBe(true);
    await expect(matchesAccept(makeFile('a.png', 'image/png'), 'image/*')).toBe(true);
    await expect(matchesAccept(makeFile('a.pdf', 'application/pdf'), 'image/*')).toBe(false);
    await expect(matchesAccept(makeFile('a.PDF', ''), '.pdf')).toBe(true);
    await expect(matchesAccept(makeFile('a.pdf', 'application/pdf'), '.doc, .pdf')).toBe(true);

    // --- validateFiles: type rejection
    const typeResult = validateFiles([makeFile('a.exe', 'application/x-msdownload')], {
      accept: 'application/pdf',
      multiple: true,
      existing: [],
    });
    await expect(typeResult.accepted).toHaveLength(0);
    await expect(typeResult.rejections).toEqual([
      { file: typeResult.rejections[0].file, reason: 'type' },
    ]);

    // --- validateFiles: size rejection
    const sizeResult = validateFiles([makeFile('big.pdf', 'application/pdf', 2048)], {
      maxSize: 1024,
      multiple: true,
      existing: [],
    });
    await expect(sizeResult.accepted).toHaveLength(0);
    await expect(sizeResult.rejections[0].reason).toBe('size');

    // --- validateFiles: capacity, counting files already selected
    const countResult = validateFiles([makeFile('b.pdf'), makeFile('c.pdf')], {
      maxFiles: 2,
      multiple: true,
      existing: [makeFile('a.pdf')],
    });
    await expect(countResult.accepted).toHaveLength(1);
    await expect(countResult.rejections[0].reason).toBe('count');

    // --- validateFiles: single-file mode keeps only the first survivor and
    // reports the rest as 'count'
    const singleResult = validateFiles([makeFile('a.pdf'), makeFile('b.pdf')], {
      multiple: false,
      existing: [],
    });
    await expect(singleResult.accepted).toHaveLength(1);
    await expect(singleResult.accepted[0].name).toBe('a.pdf');
    await expect(singleResult.rejections[0].reason).toBe('count');

    // --- validateFiles: single-file mode REPLACES, so an existing selection
    // must not consume the one available slot — this fails if alreadyUsed
    // ever counts existing files.
    const replaceResult = validateFiles([makeFile('new.pdf')], {
      multiple: false,
      existing: [makeFile('old.pdf')],
    });
    await expect(replaceResult.accepted).toHaveLength(1);
    await expect(replaceResult.accepted[0].name).toBe('new.pdf');
    await expect(replaceResult.rejections).toHaveLength(0);

    // --- validateFiles: re-picking an identical file is skipped silently,
    // NOT reported as a rejection
    const duplicate = makeFile('a.pdf');
    const dupeResult = validateFiles([duplicate], {
      multiple: true,
      existing: [makeFile('a.pdf')],
    });
    await expect(dupeResult.accepted).toHaveLength(0);
    await expect(dupeResult.rejections).toHaveLength(0);

    // --- deriveRejectionMessage: one slot, so type beats size beats count
    await expect(deriveRejectionMessage([], {})).toBeUndefined();
    await expect(
      deriveRejectionMessage([{ file: makeFile('a'), reason: 'type' }], { maxSize: 1024 })
    ).toBe('Tiedostomuotoa ei tueta');
    await expect(
      deriveRejectionMessage(
        [
          { file: makeFile('a'), reason: 'size' },
          { file: makeFile('b'), reason: 'type' },
        ],
        { maxSize: 5 * 1024 * 1024 }
      )
    ).toBe('Tiedostomuotoa ei tueta');
    await expect(
      deriveRejectionMessage([{ file: makeFile('a'), reason: 'size' }], {
        maxSize: 5 * 1024 * 1024,
      })
    ).toBe('Tiedosto on liian suuri (enintään 5 MB)');
    await expect(
      deriveRejectionMessage([{ file: makeFile('a'), reason: 'size' }], {
        maxSize: 1.5 * 1024 * 1024,
      })
    ).toBe('Tiedosto on liian suuri (enintään 1,5 MB)');
    // A near-integer byte count must still round to a clean whole number, not
    // "3.0 MB" — the decision is made on the displayed value, not the raw one.
    await expect(
      deriveRejectionMessage([{ file: makeFile('a'), reason: 'size' }], {
        maxSize: 3 * 1024 * 1024 + 100,
      })
    ).toBe('Tiedosto on liian suuri (enintään 3 MB)');
    // Sub-megabyte limits read better in kB than as "0 MB".
    await expect(
      deriveRejectionMessage([{ file: makeFile('a'), reason: 'size' }], {
        maxSize: 512 * 1024,
      })
    ).toBe('Tiedosto on liian suuri (enintään 512 kB)');
    await expect(
      deriveRejectionMessage([{ file: makeFile('a'), reason: 'size' }], {
        maxSize: 512,
      })
    ).toBe('Tiedosto on liian suuri (enintään 0,5 kB)');
    await expect(deriveRejectionMessage([{ file: makeFile('a'), reason: 'size' }], {})).toBe(
      'Tiedosto on liian suuri'
    );
    await expect(
      deriveRejectionMessage([{ file: makeFile('a'), reason: 'count' }], {
        multiple: true,
        maxFiles: 3,
      })
    ).toBe('Voit valita enintään 3 tiedostoa');
    await expect(
      deriveRejectionMessage([{ file: makeFile('a'), reason: 'count' }], { multiple: false })
    ).toBe('Voit valita enintään 1 tiedostoa');
  },
};

export const StatusText: Story = {
  args: { files: [] },
  play: async () => {
    const placeholder = 'Ei valittua tiedostoa';
    const label = defaultSelectedCountLabel;

    await expect(
      getStatusText({ files: [], multiple: true, placeholder, selectedCountLabel: label })
    ).toBe(placeholder);

    // Single-file mode shows the filename, matching a native file input.
    await expect(
      getStatusText({
        files: [makeFile('hakemus.pdf')],
        multiple: false,
        placeholder,
        selectedCountLabel: label,
      })
    ).toBe('hakemus.pdf');

    // Multi-file mode counts, with Finnish singular/partitive agreement.
    await expect(
      getStatusText({
        files: [makeFile('a.pdf')],
        multiple: true,
        placeholder,
        selectedCountLabel: label,
      })
    ).toBe('1 tiedosto valittu');
    await expect(
      getStatusText({
        files: [makeFile('a.pdf'), makeFile('b.pdf'), makeFile('c.pdf')],
        multiple: true,
        placeholder,
        selectedCountLabel: label,
      })
    ).toBe('3 tiedostoa valittu');

    // --- toFileArray normalises every shape FileButton can hand back
    await expect(toFileArray(null)).toEqual([]);
    await expect(toFileArray(makeFile('a.pdf'))).toHaveLength(1);
    await expect(toFileArray([makeFile('a.pdf'), makeFile('b.pdf')])).toHaveLength(2);
  },
};

/** Minimal harness so the hook can be exercised without either real control. */
const SelectionHarness = ({ onChange, onReject, ...options }: UseFileSelectionOptions) => {
  const { files, addFiles, removeFile, rejectionMessage } = useFileSelection({
    ...options,
    onChange,
    onReject,
  });

  return (
    <div>
      <button type="button" onClick={() => addFiles([makeFile('added.pdf', 'application/pdf')])}>
        add ok
      </button>
      {/* Distinct fixture so a replace test isn't accidentally a duplicate-skip test. */}
      <button type="button" onClick={() => addFiles([makeFile('added-2.pdf', 'application/pdf')])}>
        add ok 2
      </button>
      <button
        type="button"
        onClick={() => addFiles([makeFile('bad.exe', 'application/x-msdownload')])}
      >
        add bad
      </button>
      <span data-testid="count">{files.length}</span>
      <span data-testid="message">{rejectionMessage ?? ''}</span>
      <FileList files={files} onRemove={removeFile} />
    </div>
  );
};

export const HookUncontrolled: Story = {
  args: { files: [] },
  render: () => <SelectionHarness multiple accept="application/pdf" onChange={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('count')).toHaveTextContent('0');

    await userEvent.click(canvas.getByRole('button', { name: 'add ok' }));
    await expect(canvas.getByTestId('count')).toHaveTextContent('1');
    await expect(canvas.getByText('added.pdf')).toBeInTheDocument();

    // Removal drops the row and clears any stale message.
    await userEvent.click(canvas.getByRole('button', { name: /Poista tiedosto/ }));
    await expect(canvas.getByTestId('count')).toHaveTextContent('0');
  },
};

export const HookRejectionSurfacesMessage: Story = {
  args: { files: [] },
  render: () => <SelectionHarness multiple accept="application/pdf" onReject={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'add bad' }));
    await expect(canvas.getByTestId('message')).toHaveTextContent('Tiedostomuotoa ei tueta');
    await expect(canvas.getByTestId('count')).toHaveTextContent('0');

    // A later successful pick clears the message.
    await userEvent.click(canvas.getByRole('button', { name: 'add ok' }));
    await expect(canvas.getByTestId('message')).toHaveTextContent('');
  },
};

export const HookControlledDefersToOwner: Story = {
  args: { files: [] },
  render: () => <SelectionHarness multiple value={[]} onChange={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'add ok' }));

    // Controlled: the hook reports the new selection to the owner but renders
    // only what the owner passed back in. It cannot show a selection the owner
    // has not accepted.
    await expect(canvas.getByTestId('count')).toHaveTextContent('0');
    await expect(canvas.queryByRole('listitem')).not.toBeInTheDocument();
  },
};

export const HookSingleFileReplaces: Story = {
  args: { files: [] },
  render: () => <SelectionHarness accept="application/pdf" onChange={fn()} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Not multiple: a second pick REPLACES rather than appends. The second
    // pick uses a distinct fixture (`added-2.pdf`) — reusing the same file
    // would be silently skipped as a duplicate and pass for the wrong reason.
    await userEvent.click(canvas.getByRole('button', { name: 'add ok' }));
    await expect(canvas.getByTestId('count')).toHaveTextContent('1');
    await expect(canvas.getByText('added.pdf')).toBeInTheDocument();

    await userEvent.click(canvas.getByRole('button', { name: 'add ok 2' }));
    await expect(canvas.getByTestId('count')).toHaveTextContent('1');
    await expect(canvas.getByText('added-2.pdf')).toBeInTheDocument();
    await expect(canvas.queryByText('added.pdf')).not.toBeInTheDocument();
  },
};

export const HookRejectionMessageOverride: Story = {
  args: { files: [] },
  render: () => (
    <SelectionHarness
      multiple
      accept="application/pdf"
      rejectionMessage={(rejections) => `nope: ${rejections.length}`}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', { name: 'add bad' }));
    await expect(canvas.getByTestId('message')).toHaveTextContent('nope: 1');
  },
};
