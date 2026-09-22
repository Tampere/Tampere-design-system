import { useId, useRef } from 'react';
import { FileButton, Input } from '@mantine/core';
import { Dropzone as MantineDropzone } from '@mantine/dropzone';
import '@mantine/dropzone/styles.layer.css';
import { UploadIcon } from '../../icons/UploadIcon.tsx';
import { Button } from '../Button/Button.tsx';
import { FileList } from '../FileList/FileList.tsx';
import {
  defaultSelectedCountLabel,
  getFieldStatus,
  getStatusText,
  toFileArray,
  useFileSelection,
} from '../FileList/fileSelection.ts';
import { description, errorMessage, label, visuallyHidden } from '../FileList/fieldChrome.css.ts';
import type { FileSelectionProps } from '../FileList/types.ts';
import {
  area,
  areaInner,
  fileUpload,
  root,
  status as statusStyle,
  title as titleStyle,
} from './Dropzone.css.ts';
import { extensionMimeTypes } from './extensionMimeTypes.ts';

export interface DropzoneProps extends FileSelectionProps {
  /** Heading inside the drop area. */
  title?: string;
}

/**
 * Mantine maps `accept` onto react-dropzone's MIME map, which a bare extension
 * (`.pdf`) can't join — and a dragged file exposes no filename to match it
 * against anyway. Translate known extensions to their MIME types so the drag
 * cue agrees with the drop; `useFileSelection` stays the authority on what is
 * actually accepted, extensions included. If any extension can't be mapped,
 * return `undefined` for the whole list rather than the partial one: a
 * partial map would show the reject cue for a file `useFileSelection` still
 * accepts by filename on drop, silently blocking a valid action — the
 * permissive fallback only risks a false accept, which ends in a clear error
 * message instead.
 */
const toMimeList = (accept?: string): string[] | undefined => {
  if (!accept) return undefined;
  const entries = accept
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
  const mimeTypes: string[] = [];
  for (const entry of entries) {
    if (!entry.startsWith('.')) {
      mimeTypes.push(entry);
      continue;
    }
    const mapped = extensionMimeTypes[entry.toLowerCase()];
    if (!mapped) return undefined;
    mimeTypes.push(mapped);
  }
  return mimeTypes.length > 0 ? [...new Set(mimeTypes)] : undefined;
};

/**
 * The recommended TREDS upload control: a drop area with a picker button.
 * Use `FileInput` instead where space is tight.
 */
export const Dropzone = ({
  inputLabel,
  helperText,
  error,
  disabled,
  multiple = false,
  accept,
  maxSize,
  maxFiles,
  value,
  defaultValue,
  onChange,
  onReject,
  title = 'Pudota tiedostot tähän',
  buttonLabel = 'Valitse tiedostoja',
  placeholder = 'Ei valittua tiedostoa',
  removeLabel = 'Poista tiedosto',
  selectedCountLabel = defaultSelectedCountLabel,
  rejectionMessage,
  id,
  'aria-label': ariaLabel,
  ...props
}: DropzoneProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  // Input.Wrapper's ARIA wiring reaches only Mantine `Input` descendants, so
  // this composed control gets none of it and wires the picker Button itself.
  // See FileInput.tsx for the full reason and Input.Wrapper's own id scheme.
  const labelId = `${fieldId}-label`;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const statusId = `${fieldId}-status`;
  const buttonTextId = `${fieldId}-button-label`;
  // The drop area's own heading ("Pudota tiedostot tähän") is not reachable
  // by a keyboard user tabbing straight to the picker Button unless it's
  // wired into the button's own aria-describedby — otherwise someone who
  // never sees the area rendered (or who tabs past it) never learns
  // dropping is even possible.
  const headingId = `${fieldId}-heading`;
  // With no `inputLabel` there is no `<label>` for `labelId` to reference, and
  // a bare `aria-label` would land on Input.Wrapper's role-less `<div>`, which
  // takes no accessible name from it. Park it in a visually-hidden span the
  // Button can reference instead — see FileInput.tsx.
  const ariaLabelId = `${fieldId}-aria-label`;
  const usesAriaLabel = !inputLabel && !!ariaLabel;
  // `labelId`/`ariaLabelId` reference real DOM nodes only in their
  // respective cases above; when neither applies (no `inputLabel` and no
  // `aria-label`), the Button's accessible name falls back to its own
  // visible text alone via `buttonTextId`.
  const nameSourceId = inputLabel ? labelId : usesAriaLabel ? ariaLabelId : undefined;

  // Reset the hidden input after every pick so re-selecting the same file
  // fires `change` again — see FileInput.tsx.
  const resetRef = useRef<() => void>(null);
  // Emptying the list unmounts the row that had focus — FileList has no
  // picker Button of its own, so it hands focus-return back here via
  // `onEmptied`.
  const buttonRef = useRef<HTMLButtonElement>(null);

  // `data-testid` isn't part of InputHTMLAttributes' declared type, so it
  // has to reach `inputProps` through a variable rather than an inline
  // object literal — TS's excess-property check only fires on literals
  // assigned directly, not on an already-typed variable passed through.
  const fileInputProps = { disabled, 'data-testid': 'dropzone-file-input' };

  const {
    files,
    addFiles,
    removeFile,
    rejectionMessage: derivedMessage,
  } = useFileSelection({
    value,
    defaultValue,
    onChange,
    onReject,
    accept,
    maxSize,
    maxFiles,
    multiple,
    rejectionMessage,
  });

  const message = error ?? derivedMessage;
  const status = getFieldStatus(!!message, disabled);

  const describedBy = [
    headingId,
    helperText ? descriptionId : undefined,
    message ? errorId : undefined,
    statusId,
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ');

  return (
    <Input.Wrapper
      id={fieldId}
      label={inputLabel}
      description={helperText}
      error={message}
      unstyled
      classNames={{
        root,
        label: label[status],
        description: description[status],
        error: errorMessage,
      }}
      {...props}
    >
      <MantineDropzone
        // `onDrop`/`onReject` each fire separately for one drop — react-
        // dropzone's onDropCb calls onDropRejected *then* onDropAccepted
        // for the same mixed drop, so wiring both to addFiles would call it
        // twice per event, violating useFileSelection's "at most once per
        // user event" invariant (the second call's `next` is computed from
        // the first call's now-stale `files`, so a mixed drop can drop or
        // resurrect files, and the two calls' `setRejections` fight over
        // the message). `onDropAny` is the one callback react-dropzone
        // invokes exactly once per event with both outcomes together, so
        // it's the real handler; `onDrop` stays a required no-op purely to
        // satisfy Mantine's types.
        onDrop={() => {}}
        onDropAny={(accepted, rejections) =>
          addFiles([...accepted, ...rejections.map(({ file }) => file)])
        }
        accept={toMimeList(accept)}
        maxSize={maxSize}
        multiple={multiple}
        disabled={disabled}
        // The Button owns the picker; the area must not be a second click or
        // focus/keyboard-activation target on top of it. `activateOnClick`
        // alone leaves the root at `tabindex="0"` — react-dropzone only drops
        // it when keyboard activation is also off.
        activateOnClick={false}
        activateOnKeyboard={false}
        // react-dropzone hides its own picker input with the visually-hidden
        // clip technique rather than `display: none`, which keeps it in the
        // accessibility tree — so axe reports a critical `label` violation
        // ("Form elements must have labels") against an input that has no
        // label and, with both activate-on-* off above, nothing in this
        // component ever opens. Labelling it would be worse: it would announce
        // a second file picker that does nothing. Hide it the way Mantine's own
        // FileButton hides the *real* picker input instead. Dropping still
        // works — those handlers live on the root via `getRootProps`, not here.
        inputProps={{ style: { display: 'none' } }}
        // Mantine's inner wrapper is `pointer-events: none` by default, so
        // that clicks pass through to the root's own open-dialog handler —
        // fine when the only content is Mantine's own status icons, but it
        // silently swallows every click on our real interactive children
        // (the picker Button) unless turned back on.
        enablePointerEvents
        className={area[status]}
        // The children stack inside Mantine's `inner` div, not the root, so the
        // flex column has to land there — see `areaInner` in Dropzone.css.ts.
        classNames={{ inner: areaInner }}
        data-testid="dropzone-area"
      >
        <p id={headingId} className={titleStyle[status]}>
          {title}
        </p>
        {/* Only rendered when there's no `inputLabel` to derive the
            accessible name from instead — the Button's own `aria-labelledby`
            below points at this id in that case. */}
        {usesAriaLabel && (
          <span id={ariaLabelId} className={visuallyHidden}>
            {ariaLabel}
          </span>
        )}
        <div className={fileUpload}>
          <FileButton
            resetRef={resetRef}
            onChange={(picked) => {
              // A throwing consumer onChange must not skip the reset — the
              // input would keep the picked file and never fire `change` again.
              try {
                addFiles(toFileArray(picked));
              } finally {
                resetRef.current?.();
              }
            }}
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            // See FileInput.tsx for why `disabled` must also be set on inputProps.
            // The data-testid disambiguates this input from MantineDropzone's own
            // hidden (and here inert) one.
            inputProps={fileInputProps}
          >
            {(fileButtonProps) => (
              <Button
                {...fileButtonProps}
                ref={buttonRef}
                id={fieldId}
                // See FileInput.tsx for why the second reference must be a
                // *separate* element (`buttonTextId`, not this button's own
                // id): a self-referencing aria-labelledby entry is treated as
                // a cycle and contributes nothing, silently dropping the
                // button's own text from the accessible name.
                aria-labelledby={[nameSourceId, buttonTextId].filter(Boolean).join(' ')}
                aria-describedby={describedBy || undefined}
                aria-invalid={message ? true : undefined}
                disabled={disabled}
                leftIcon={<UploadIcon />}
              >
                <span id={buttonTextId}>{buttonLabel}</span>
              </Button>
            )}
          </FileButton>
          {/* Announced passively on change and via the Button's aria-describedby
              on focus — see FileInput.tsx. */}
          <span role="status" id={statusId} className={statusStyle[status]}>
            {getStatusText({ files, multiple, placeholder, selectedCountLabel })}
          </span>
        </div>
      </MantineDropzone>
      {/* Rendered in single-file mode too: the row's ✕ is the only way to clear
          rather than overwrite a selection — see FileInput.tsx. */}
      <FileList
        files={files}
        onRemove={removeFile}
        removeLabel={removeLabel}
        disabled={disabled}
        onEmptied={() => buttonRef.current?.focus()}
      />
    </Input.Wrapper>
  );
};
