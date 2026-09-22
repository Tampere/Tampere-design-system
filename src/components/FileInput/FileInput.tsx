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
  // Input.Wrapper's `describedBy` reaches Mantine `Input` descendants through
  // InputWrapperProvider context, which our composed control (a div/span/Button)
  // doesn't consume — and `aria-invalid` isn't on that context at all, so even a
  // real `Input` derives it from its own `error` prop. Mirror Input.Wrapper's id
  // scheme (`${idBase}-label`, `${idBase}-description`, `${idBase}-error`, where
  // idBase is the `id` we pass it below) and wire the picker Button explicitly.
  const labelId = `${fieldId}-label`;
  const descriptionId = `${fieldId}-description`;
  const errorId = `${fieldId}-error`;
  const statusId = `${fieldId}-status`;
  const buttonTextId = `${fieldId}-button-label`;
  // Input.Wrapper renders no `<label>` at all when `inputLabel` is unset, so
  // `labelId` above wouldn't reference anything real — and an `aria-label`
  // left in the spread would land on Input.Wrapper's role-less wrapper
  // `<div>`, which takes no accessible name from it. Pull `aria-label` out of
  // the spread (above) and, when there's no `inputLabel` to fall back to, park
  // its text in a visually-hidden span the Button's own `aria-labelledby` can
  // reference instead.
  const ariaLabelId = `${fieldId}-aria-label`;
  const usesAriaLabel = !inputLabel && !!ariaLabel;
  const nameSourceId = inputLabel ? labelId : usesAriaLabel ? ariaLabelId : undefined;

  // Reset the hidden input after every pick so re-selecting the exact same
  // file fires `change` again — browsers don't fire it when the FileList a
  // dialog returns is unchanged from the input's current value, which
  // otherwise silently no-ops re-picking a file the user just removed.
  const resetRef = useRef<() => void>(null);
  // Emptying the list unmounts the row that had focus — FileList has no
  // picker Button of its own, so it hands focus-return back here via
  // `onEmptied`.
  const buttonRef = useRef<HTMLButtonElement>(null);

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
          // FileButton's `disabled` only guards its own onClick handler — it
          // does not disable the native input it renders. Set the attribute
          // directly so the real focus/pick path is actually disabled too.
          inputProps={{ disabled }}
        >
          {(fileButtonProps) => (
            <Button
              {...fileButtonProps}
              ref={buttonRef}
              id={fieldId}
              // Referencing the label plus this button's own visible text keeps
              // the accessible name "<label> <button text>" instead of replacing
              // it. The second reference must be a *separate* element
              // (`buttonTextId`, not this button's id): the accessible-name
              // algorithm treats a self-reference as a cycle and contributes
              // nothing, silently dropping the button's text. The label's own
              // `for` still targets this Button via `id`, so clicking the label
              // opens the picker. Without `inputLabel`, `labelId` isn't in the
              // DOM and browsers skip the missing reference, falling back to
              // `ariaLabelId` or to the button's text alone.
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
