import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent, waitFor } from '@storybook/testing-library';
import { expect, fireEvent, fn } from 'storybook/test';
import { Dropzone } from './Dropzone';

const makeFile = (name: string, type = 'application/pdf', size = 1024) =>
  new File(['x'.repeat(size)], name, { type, lastModified: 1 });

/**
 * Two hidden `input[type=file]` elements exist in the DOM: Mantine's own
 * `MantineDropzone` renders one internally (inert here — `activateOnClick`/
 * `activateOnKeyboard` are both off, so nothing ever opens it), and
 * `FileButton` renders a second one, which the visible `Button` actually
 * opens. `Dropzone.tsx` gives `FileButton`'s input its own
 * `data-testid="dropzone-file-input"` (via `inputProps`) so tests can target
 * it unambiguously instead of relying on DOM order.
 */
const hiddenInput = (canvasElement: HTMLElement) =>
  canvasElement.querySelector<HTMLInputElement>('[data-testid="dropzone-file-input"]')!;

/** Fires a real drop with a DataTransfer, which is how react-dropzone reads files. */
const dropFiles = async (target: Element, files: File[]) => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));

  target.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer }));
  target.dispatchEvent(new DragEvent('dragover', { bubbles: true, dataTransfer }));
  target.dispatchEvent(new DragEvent('drop', { bubbles: true, dataTransfer }));
};

/**
 * Delivers files to the hidden input the way a permissive OS dialog would,
 * bypassing `userEvent.upload`'s own `accept`-attribute filtering (it mimics
 * a restrictive file dialog and silently drops non-matching files before
 * they ever reach `onChange`). Use this when the story's whole point is to
 * exercise our own `useFileSelection` validation on a file that made it
 * through — the native `accept` attribute is the picker's filter, not ours.
 */
const injectFiles = (input: HTMLInputElement, files: File[]) => {
  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  fireEvent.change(input, { target: { files: dataTransfer.files } });
};

const meta = {
  component: Dropzone,
  tags: ['!dev', '!autodocs'],
  args: {
    inputLabel: 'Liitetiedostot',
    'data-testid': 'dropzone',
  },
} satisfies Meta<typeof Dropzone>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByText('Pudota tiedostot tähän')).toBeInTheDocument();
    // Accessible name is "<label> <button text>" — see Dropzone.tsx's
    // aria-labelledby wiring, mirrored from FileInput.
    await expect(
      canvas.getByRole('button', { name: 'Liitetiedostot Valitse tiedostoja' })
    ).toBeInTheDocument();
    await expect(canvas.getByText('Ei valittua tiedostoa')).toBeInTheDocument();

    // Mantine's root rule applies its own `--dropzone-radius` unless we declare
    // `border-radius` ourselves — unlayered CSS only outranks it per property.
    // Figma's Effects/Corner-radius/Default is 0.
    await expect(getComputedStyle(canvas.getByTestId('dropzone-area')).borderRadius).toBe('0px');
  },
};

export const WithHelperText: Story = {
  tags: docExample,
  args: { helperText: 'Sallitut muodot: PDF' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helper = canvas.getByText('Sallitut muodot: PDF');
    await expect(helper).toBeInTheDocument();

    // See FileInput.stories.tsx's WithHelperText: the shared `fieldChrome`
    // description style has to zero the `<p>` UA margin itself, because
    // `unstyled` drops the Mantine class that normally does.
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

    // Figma Common/Error = Red/300 (#ae1e20).
    await expect(getComputedStyle(message).color).toBe('rgb(174, 30, 32)');
    await expect(getComputedStyle(canvas.getByText('Pudota tiedostot tähän')).color).toBe(
      'rgb(174, 30, 32)'
    );
    // The message and heading colours are asserted above, but neither pins
    // the box border itself — deleting `area.error`'s borderColor override
    // would break neither. Mirrors FileInput.stories.tsx's Error story.
    await expect(getComputedStyle(canvas.getByTestId('dropzone-area')).borderColor).toBe(
      'rgb(174, 30, 32)'
    );
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

    // Disabling the picker Button is not the same guarantee as disabling
    // the drop target itself — assert dropping a file while disabled is
    // actually a no-op, rather than relying on Mantine's `disabled` doing
    // the right thing unverified.
    await dropFiles(canvas.getByTestId('dropzone-area'), [makeFile('ohitettu.pdf')]);
    await expect(canvas.queryByRole('listitem')).not.toBeInTheDocument();
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

export const DroppingFilesSelectsThem: Story = {
  args: { multiple: true, onChange: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await dropFiles(canvas.getByTestId('dropzone-area'), [makeFile('pudotettu.pdf')]);

    await waitFor(async () => {
      // The filename appears twice by design once dropped: in the status
      // line and in the removable row beneath. Scope to the row so this
      // assertion doesn't depend on the (deliberate) duplication.
      const row = canvas.getByRole('listitem');
      await expect(within(row).getByText('pudotettu.pdf')).toBeInTheDocument();
    });
    await expect(args.onChange).toHaveBeenCalled();
  },
};

export const DroppingARejectedFileShowsMessage: Story = {
  args: { accept: 'application/pdf', onReject: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    await dropFiles(canvas.getByTestId('dropzone-area'), [
      makeFile('virus.exe', 'application/x-msdownload'),
    ]);

    await waitFor(async () => {
      await expect(canvas.getByText('Tiedostomuotoa ei tueta')).toBeInTheDocument();
    });
    await expect(args.onReject).toHaveBeenCalled();
  },
};

export const PickingViaButtonAlsoWorks: Story = {
  args: { multiple: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.upload(hiddenInput(canvasElement), makeFile('valittu.pdf'));

    const row = canvas.getByRole('listitem');
    await expect(within(row).getByText('valittu.pdf')).toBeInTheDocument();
  },
};

export const RejectsWrongTypeViaPicker: Story = {
  args: { accept: 'application/pdf', onReject: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // userEvent.upload honours the input's `accept` attribute and would drop
    // this file before our own validation saw it, making this pass for the
    // wrong reason. Inject directly so this exercises the FileButton picker
    // path's own useFileSelection rejection, independent of the drop path
    // covered by DroppingARejectedFileShowsMessage above.
    injectFiles(hiddenInput(canvasElement), [makeFile('virus.exe', 'application/x-msdownload')]);

    await expect(canvas.getByText('Tiedostomuotoa ei tueta')).toBeInTheDocument();
    await expect(args.onReject).toHaveBeenCalled();
  },
};

export const ClickingTheAreaDoesNotOpenThePicker: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const area = canvas.getByTestId('dropzone-area');

    // activateOnClick and activateOnKeyboard are both off: the Button is the
    // only picker trigger, so the area itself must not be a focus stop at
    // all — not just "not tabindex=0" (react-dropzone would otherwise still
    // add tabindex="0" for keyboard activation alone).
    await expect(area).not.toHaveAttribute('tabindex');
  },
};

export const LabelIsAssociatedAndErrorIsDescribed: Story = {
  args: { error: 'Kuvaava virheviesti', helperText: 'Ohjeteksti' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Input.Wrapper's own describedBy/aria-invalid wiring only reaches
    // Mantine `Input` descendants via context — our composed control (a
    // div/p/span/Button) doesn't consume it, so Dropzone wires the picker
    // Button explicitly instead, exactly like FileInput. Assert the wiring
    // itself, not just that the label/helper/error text happens to render
    // somewhere on the page.
    const button = canvas.getByRole('button', { name: 'Liitetiedostot Valitse tiedostoja' });
    await expect(button).toBeInTheDocument();

    const describedByIds = button.getAttribute('aria-describedby')?.split(' ') ?? [];
    await expect(describedByIds.length).toBeGreaterThan(0);
    const describedText = describedByIds
      .map((id) => canvasElement.querySelector(`[id="${id}"]`)?.textContent ?? '')
      .join(' ');
    await expect(describedText).toContain('Ohjeteksti');
    await expect(describedText).toContain('Kuvaava virheviesti');
    // A keyboard user tabbing straight to the picker Button must also learn
    // dropping is possible — the drop area's own heading has to be in the
    // description too, not just the helper text and error.
    await expect(describedText).toContain('Pudota tiedostot tähän');
    // And specifically first, ahead of description/error/status — see
    // Dropzone.tsx's `describedBy` ordering.
    await expect(describedByIds[0]).toBe(`${button.getAttribute('id')}-heading`);

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
    // accessible name is via the visually-hidden span Dropzone.tsx wires
    // into the Button's own aria-labelledby, exactly like FileInput. Query
    // by the resulting accessible name itself, the same empirical standard
    // the aria-labelledby ordering question was settled with earlier.
    const button = canvas.getByRole('button', { name: 'Liitteet Valitse tiedostoja' });
    await expect(button).toBeInTheDocument();

    // The button's own visible text must survive alongside the consumer's
    // label, not be replaced by it.
    await expect(canvas.getByText('Valitse tiedostoja')).toBeInTheDocument();

    // And the wrapper `<div>` (role-less, so aria-label on it would be
    // inert anyway) must not carry the attribute — it should have been
    // pulled out of the spread and consumed deliberately, not left inert.
    await expect(canvas.getByTestId('dropzone')).not.toHaveAttribute('aria-label');
  },
};

// One of the ~6 doc stories the spec calls for: the drag-over state is the
// one state Figma never drew, so it belongs in autodocs precisely because
// nothing else shows it.
export const DragOverStylesTheArea: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const area = canvas.getByTestId('dropzone-area');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(makeFile('drag.pdf'));

    area.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer }));

    await waitFor(() => {
      expect(area).toHaveAttribute('data-accept', 'true');
    });
    // The attribute landing doesn't prove the style actually applies — this
    // also exercises the layer-precedence assumption the whole stylesheet
    // rests on (our unlayered Vanilla Extract CSS has to beat Mantine's own
    // `@layer mantine` rules for the same element).
    // dropzone.dragOver.border → states.hover → brand.blue.mainDarker (#1d3a6c).
    await waitFor(() => {
      expect(getComputedStyle(area).borderColor).toBe('rgb(29, 58, 108)');
    });
  },
};

export const DragRejectStylesTheHeading: Story = {
  args: { accept: 'application/pdf' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const area = canvas.getByTestId('dropzone-area');
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(makeFile('virus.exe', 'application/x-msdownload'));

    area.dispatchEvent(new DragEvent('dragenter', { bubbles: true, dataTransfer }));

    await waitFor(() => {
      expect(area).toHaveAttribute('data-reject', 'true');
    });
    // Figma calls for the heading, not just the border, to go error-red
    // while an unacceptable file is dragged over.
    await waitFor(() => {
      expect(getComputedStyle(canvas.getByText('Pudota tiedostot tähän')).color).toBe(
        'rgb(174, 30, 32)'
      );
    });
  },
};

export const MixedDropAcceptsValidFileAndReportsRejection: Story = {
  args: { multiple: true, accept: 'application/pdf', onChange: fn(), onReject: fn() },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);

    // react-dropzone's onDropCb calls onDropRejected then onDropAccepted for
    // one mixed drop; both must be reflected together, not have the second
    // call silently wipe what the first one set (Dropzone.tsx funnels both
    // into a single onDropAny call for exactly this reason).
    await dropFiles(canvas.getByTestId('dropzone-area'), [
      makeFile('ok.pdf'),
      makeFile('bad.exe', 'application/x-msdownload'),
    ]);

    await waitFor(async () => {
      const row = canvas.getByRole('listitem');
      await expect(within(row).getByText('ok.pdf')).toBeInTheDocument();
    });
    await expect(canvas.getByText('Tiedostomuotoa ei tueta')).toBeInTheDocument();
    await expect(args.onChange).toHaveBeenCalled();
    await expect(args.onReject).toHaveBeenCalled();
  },
};

export const MixedDropWithExtensionAcceptKeepsBothFiles: Story = {
  // Mantine's `accept` only understands MIME entries (see `toMimeList`), so
  // it doesn't know `.doc` is allowed — it would report `memo.doc` as
  // rejected even though useFileSelection (the real authority, extensions
  // included) accepts it. Pins the case a two-call handler would drop a
  // file for: call 1 would commit `[memo.doc]` from a stale `files`, call 2
  // would then overwrite that with `[ok.pdf]` alone.
  args: { multiple: true, accept: 'application/pdf,.doc' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await dropFiles(canvas.getByTestId('dropzone-area'), [
      makeFile('ok.pdf'),
      makeFile('memo.doc', 'application/msword'),
    ]);

    await waitFor(async () => {
      const rows = canvas.getAllByRole('listitem');
      await expect(rows).toHaveLength(2);
    });
    const rows = canvas.getAllByRole('listitem');
    await expect(within(rows[0]).getByText('ok.pdf')).toBeInTheDocument();
    await expect(within(rows[1]).getByText('memo.doc')).toBeInTheDocument();
  },
};

/**
 * Measures the real rendered geometry rather than the declared CSS, because
 * the bug this guards against was invisible to a CSS reading: the flex column
 * was applied to Mantine's Dropzone *root*, while the children actually stack
 * inside Mantine's own `inner` div one level deeper, so `gap` governed nothing
 * and the area's gaps came from incidental block/line-box spacing instead.
 */
export const AreaGapsMatchFigma: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const heading = canvas.getByText('Pudota tiedostot tähän');
    const button = canvas.getByRole('button', { name: /Valitse tiedostoja/ });
    const statusLine = canvas.getByRole('status');

    const gapBetween = (above: Element, below: Element) =>
      below.getBoundingClientRect().top - above.getBoundingClientRect().bottom;

    await waitFor(() => {
      // Figma `Drop zone` 6801:5875 — auto-layout gap Spacing/4, a raw
      // primitive that stays 32 at every breakpoint.
      expect(gapBetween(heading, button)).toBeCloseTo(32, 0);
      // Figma `File count container` 6801:7173 — the status line's own
      // Components/Input/Padding/Vertical, rendered here as a gap.
      expect(gapBetween(button, statusLine)).toBeCloseTo(16, 0);
    });
  },
};
