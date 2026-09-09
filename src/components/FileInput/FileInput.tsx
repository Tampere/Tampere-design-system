import { useId, useRef } from 'react';
import { FileButton, Input } from '@mantine/core';
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
import { control, display, root, statusText } from './FileInput.css.ts';

export type FileInputProps = FileSelectionProps;

/**
 * File-selection control for tight layouts: a picker button fused to a status
 * display. For a roomier, more discoverable control, prefer `Dropzone` — Figma
 * names it the recommended way to upload files.
 */
export const FileInput = ({
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
  buttonLabel = 'Valitse tiedostoja',
  placeholder = 'Ei valittua tiedostoa',
  removeLabel = 'Poista tiedosto',
  selectedCountLabel = defaultSelectedCountLabel,
  rejectionMessage,
  id,
  'aria-label': ariaLabel,
  ...props
}: FileInputProps) => {
  const generatedId = useId();
  const fieldId = id ?? generatedId;
  // Input.Wrapper's own `describedBy`/`aria-invalid` wiring only reaches
  // Mantine `Input` descendants via InputWrapperProvider context — our
  // composed control (a div/span/Button) doesn't consume it, so nothing gets
  // associated automatically. Mirror Input.Wrapper's own id scheme (read
  // straight from its source: `${idBase}-label`, `${idBase}-description`,
  // `${idBase}-error`, where idBase is the `id` we pass it below) and wire
  // the picker Button explicitly instead.
  const labelId = `${fieldId}-label`;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const statusId = `${fieldId}-status`;
  const buttonTextId = `${fieldId}-button-label`;
  // Input.Wrapper renders no `<label>` at all when `inputLabel` is unset, so
  // `labelId` above wouldn't reference anything real — and the AriaAttributes
  // spread means a bare `aria-label` on Input.Wrapper would land on its
  // role-less wrapper `<div>`, which takes no accessible name from it. Pull
  // `aria-label` out of the spread (above) and, when there's no `inputLabel`
  // to fall back to, park its text in a visually-hidden span the Button's
  // own `aria-labelledby` can reference instead.
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
      <div className={control}>
        {/* Only rendered when there's no `inputLabel` to derive the
            accessible name from instead — the Button's own `aria-labelledby`
            below points at this id in that case. */}
        {usesAriaLabel && (
          <span id={ariaLabelId} className={visuallyHidden}>
            {ariaLabel}
          </span>
        )}
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
          inputProps={{ disabled }}
        >
          {(fileButtonProps) => (
            <Button
              {...fileButtonProps}
              id={fieldId}
              // Referencing the label plus this button's own visible text
              // keeps the accessible name "<label> <button text>" instead of
              // replacing it outright. The second reference has to be a
              // *separate* element (`buttonTextId` below, not the button's
              // own id) — the accessible-name algorithm skips a
              // self-referencing aria-labelledby entry (it's already the node
              // being named, so recursing into it again is treated as a
              // cycle and contributes nothing), confirmed empirically: a
              // trial with `${labelId} ${fieldId}` here produced the
              // accessible name "Liitetiedostot" alone, silently dropping the button
              // text. The label's own `for` (Input.Wrapper always points it
              // at `fieldId`) still targets this Button via its `id`, so
              // clicking the label activates the picker too.
              //
              // Without `inputLabel`, `labelId` doesn't exist in the DOM
              // (Input.Wrapper renders no `<label>` at all) and a browser
              // simply skips a missing aria-labelledby reference — so this
              // falls back to `ariaLabelId` (the visually-hidden span above,
              // present only when a consumer `aria-label` was actually
              // supplied) instead, keeping the same "<label> <button text>"
              // shape either way.
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
        <span role="status" id={statusId} className={display[status]}>
          <span className={statusText}>
            {getStatusText({ files, multiple, placeholder, selectedCountLabel })}
          </span>
        </span>
      </div>
      {/* Renders whenever a file is selected, single-file mode included: in
          single-file mode the status line shows the filename but has no
          remove affordance of its own, so the row's ✕ is the only way to
          clear the selection rather than merely overwrite it. */}
      <FileList files={files} onRemove={removeFile} removeLabel={removeLabel} disabled={disabled} />
    </Input.Wrapper>
  );
};
