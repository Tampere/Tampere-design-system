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

export interface DropzoneProps extends FileSelectionProps {
  /** Heading inside the drop area. */
  title?: string;
}

/**
 * Mantine's `accept` maps a string list onto react-dropzone's MIME map, so a
 * bare extension (`.pdf`) is meaningless there. Pass only MIME entries — this
 * drives Mantine's drag visuals only; `useFileSelection` remains the authority
 * on what is actually accepted, extensions included.
 */
const toMimeList = (accept?: string): string[] | undefined => {
  if (!accept) return undefined;
  const mimeTypes = accept
    .split(',')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0 && !entry.startsWith('.'));
  return mimeTypes.length > 0 ? mimeTypes : undefined;
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
  // Input.Wrapper's own `describedBy`/`aria-invalid` wiring only reaches
  // Mantine `Input` descendants via InputWrapperProvider context — our
  // composed control (a div/p/span/Button) doesn't consume it, so nothing
  // gets associated automatically. Mirror Input.Wrapper's own id scheme
  // (`${idBase}-label`, `${idBase}-description`, `${idBase}-error`, where
  // idBase is the `id` we pass it below) and wire the picker Button
  // explicitly instead — the exact scheme FileInput.tsx uses.
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
  // Input.Wrapper renders no `<label>` at all when `inputLabel` is unset, so
  // `labelId` above wouldn't reference anything real — and the AriaAttributes
  // spread means a bare `aria-label` on Input.Wrapper would land on its
  // role-less wrapper `<div>`, which takes no accessible name from it. Pull
  // `aria-label` out of the spread (above) and, when there's no `inputLabel`
  // to fall back to, park its text in a visually-hidden span the Button's
  // own `aria-labelledby` can reference instead — mirrors FileInput.tsx.
  const ariaLabelId = `${fieldId}-aria-label`;
  const usesAriaLabel = !inputLabel && !!ariaLabel;
  // `labelId`/`ariaLabelId` reference real DOM nodes only in their
  // respective cases above; when neither applies (no `inputLabel` and no
  // `aria-label`), the Button's accessible name falls back to its own
  // visible text alone via `buttonTextId`.
  const nameSourceId = inputLabel ? labelId : usesAriaLabel ? ariaLabelId : undefined;

  // Reset the hidden input after every pick so re-selecting the exact same
  // file fires `change` again — browsers don't fire it when the FileList a
  // dialog returns is unchanged from the input's current value, which
  // otherwise silently no-ops re-picking a file the user just removed.
  const resetRef = useRef<() => void>(null);

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

  // A consumer-level error always wins over a derived rejection message.
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
        // alone leaves the root at `tabindex="0"` (react-dropzone only drops
        // it when keyboard activation is also off) — verified empirically,
        // not merely assumed.
        activateOnClick={false}
        activateOnKeyboard={false}
        // Mantine's inner wrapper is `pointer-events: none` by default, so
        // that clicks pass through to the root's own open-dialog handler —
        // fine when the only content is Mantine's own status icons, but it
        // silently swallows every click on our real interactive children
        // (the picker Button) unless turned back on. Found by testing, not
        // documented in the props' own doc comment.
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
          {/* Same picker path as FileInput, so both controls behave identically. */}
          <FileButton
            resetRef={resetRef}
            onChange={(picked) => {
              addFiles(toFileArray(picked));
              resetRef.current?.();
            }}
            multiple={multiple}
            accept={accept}
            disabled={disabled}
            // FileButton's `disabled` only guards its own onClick handler — it
            // does not disable the native input it renders. Set the attribute
            // directly so the real focus/pick path is actually disabled too.
            // The `data-testid` gives tests an unambiguous handle on this
            // input specifically — MantineDropzone renders its own separate
            // (inert here) hidden input too, so a bare `input[type="file"]`
            // selector is ambiguous between the two.
            inputProps={fileInputProps}
          >
            {(fileButtonProps) => (
              <Button
                {...fileButtonProps}
                id={fieldId}
                // See FileInput.tsx for why the second reference must be a
                // *separate* element (`buttonTextId`, not this button's own
                // id): a self-referencing aria-labelledby entry is treated as
                // a cycle and contributes nothing, silently dropping the
                // button's own text from the accessible name. `nameSourceId`
                // (also mirrored from FileInput.tsx) falls back to
                // `ariaLabelId` when there's no `inputLabel`, or is omitted
                // entirely when there's neither.
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
          {/* role="status" so a screen reader hears the selection change
              passively; also referenced via aria-describedby above so it's
              announced when the Button itself receives focus. */}
          <span role="status" id={statusId} className={statusStyle[status]}>
            {getStatusText({ files, multiple, placeholder, selectedCountLabel })}
          </span>
        </div>
      </MantineDropzone>
      {/* Renders whenever a file is selected, single-file mode included: in
          single-file mode the status line shows the filename but has no
          remove affordance of its own, so the row's ✕ is the only way to
          clear the selection rather than merely overwrite it. */}
      <FileList files={files} onRemove={removeFile} removeLabel={removeLabel} disabled={disabled} />
    </Input.Wrapper>
  );
};
