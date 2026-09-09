import { useState } from 'react';
import type { FileRejection, FileRejectionReason } from './types.ts';

/**
 * Matches a file against a native `accept` string — exact MIME
 * (`application/pdf`), wildcard MIME (`image/*`) or extension (`.pdf`).
 * An empty/absent `accept` matches everything, as the native attribute does.
 */
export const matchesAccept = (file: File, accept?: string): boolean => {
  if (!accept) return true;

  return accept
    .split(',')
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) => {
      if (entry.startsWith('.')) return file.name.toLowerCase().endsWith(entry);
      if (entry.endsWith('/*')) return file.type.toLowerCase().startsWith(entry.slice(0, -1));
      return file.type.toLowerCase() === entry;
    });
};

/**
 * Identity check for a picked file. `File` has no id, so name + size +
 * lastModified is the closest thing to one.
 */
export const isSameFile = (a: File, b: File): boolean =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

export interface ValidateFilesOptions {
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  /** Files already selected — counted against capacity, and used for duplicate detection. */
  existing: File[];
}

export interface ValidateFilesResult {
  accepted: File[];
  rejections: FileRejection[];
}

/**
 * Validates a batch of picked or dropped files in a fixed order — type, then
 * size, then remaining capacity — and returns both outcomes in one pass. Used
 * for the picker path and the drop path alike, so the two cannot disagree.
 */
export const validateFiles = (
  incoming: File[],
  { accept, maxSize, maxFiles, multiple, existing }: ValidateFilesOptions
): ValidateFilesResult => {
  const accepted: File[] = [];
  const rejections: FileRejection[] = [];

  // Single-file mode replaces the selection, so nothing already selected
  // occupies capacity; multi-file mode fills the remaining slots.
  const limit = multiple ? maxFiles : 1;
  const alreadyUsed = multiple ? existing.length : 0;

  incoming.forEach((file) => {
    if (!matchesAccept(file, accept)) {
      rejections.push({ file, reason: 'type' });
      return;
    }
    if (maxSize !== undefined && file.size > maxSize) {
      rejections.push({ file, reason: 'size' });
      return;
    }
    // Re-picking a file that is already selected is not a user error — skip it
    // silently rather than reporting a rejection.
    const isDuplicate =
      existing.some((candidate) => isSameFile(candidate, file)) ||
      accepted.some((candidate) => isSameFile(candidate, file));
    if (isDuplicate) return;

    if (limit !== undefined && alreadyUsed + accepted.length >= limit) {
      rejections.push({ file, reason: 'count' });
      return;
    }
    accepted.push(file);
  });

  return { accepted, rejections };
};

/**
 * Whole units read better than "5,0 MB"; sub-megabyte limits read better in
 * kB than as "0 MB". Finnish uses a comma decimal separator ("1,5 MB", not
 * "1.5 MB"), unlike `toFixed`'s always-a-dot output — swapped in after
 * rounding, once a genuine fraction survives the whole-unit check above.
 */
const formatFileSize = (bytes: number): string => {
  const trim = (value: number) => {
    const rounded = value.toFixed(1);
    return rounded.endsWith('.0') ? rounded.slice(0, -2) : rounded.replace('.', ',');
  };

  const megabytes = bytes / 1024 / 1024;
  if (megabytes < 1) return `${trim(bytes / 1024)} kB`;
  return `${trim(megabytes)} MB`;
};

export interface RejectionMessageOptions {
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
}

/**
 * Derives the single Finnish error line for a batch of rejections. Figma
 * specifies one error slot, so the first reason in validation order wins.
 */
export const deriveRejectionMessage = (
  rejections: FileRejection[],
  { maxSize, maxFiles, multiple }: RejectionMessageOptions
): string | undefined => {
  if (rejections.length === 0) return undefined;

  const precedence: FileRejectionReason[] = ['type', 'size', 'count'];
  const reason = precedence.find((candidate) =>
    rejections.some((rejection) => rejection.reason === candidate)
  );

  switch (reason) {
    case 'type':
      return 'Tiedostomuotoa ei tueta';
    case 'size':
      return maxSize === undefined
        ? 'Tiedosto on liian suuri'
        : `Tiedosto on liian suuri (enintään ${formatFileSize(maxSize)})`;
    case 'count':
      return `Voit valita enintään ${multiple ? (maxFiles ?? 1) : 1} tiedostoa`;
    default:
      return undefined;
  }
};

/** Finnish count agreement: singular nominative for one, partitive above that. */
export const defaultSelectedCountLabel = (count: number): string =>
  count === 1 ? '1 tiedosto valittu' : `${count} tiedostoa valittu`;

export interface StatusTextOptions {
  files: File[];
  multiple?: boolean;
  placeholder: string;
  selectedCountLabel: (count: number) => string;
}

/**
 * The status line both controls show: the placeholder when empty, the filename
 * in single-file mode (as a native file input does), otherwise a count.
 */
export const getStatusText = ({
  files,
  multiple,
  placeholder,
  selectedCountLabel,
}: StatusTextOptions): string => {
  if (files.length === 0) return placeholder;
  if (!multiple) return files[0].name;
  return selectedCountLabel(files.length);
};

/**
 * `FileButton`'s payload type collapses to `File | null` when `multiple` is a
 * runtime boolean rather than a literal, though it really hands back an array
 * when multiple is set. Normalises both shapes. Shared so `FileInput` and
 * `Dropzone` read the picker identically.
 */
export const toFileArray = (picked: File[] | File | null): File[] => {
  if (!picked) return [];
  return Array.isArray(picked) ? picked : [picked];
};

export interface UseFileSelectionOptions {
  value?: File[];
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  accept?: string;
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  rejectionMessage?: (rejections: FileRejection[]) => string;
}

/**
 * Owns the selection for both file controls: controlled/uncontrolled state,
 * validation of every incoming batch, and the derived error line.
 */
export const useFileSelection = ({
  value,
  defaultValue,
  onChange,
  onReject,
  accept,
  maxSize,
  maxFiles,
  multiple,
  rejectionMessage,
}: UseFileSelectionOptions) => {
  const [internalFiles, setInternalFiles] = useState<File[]>(defaultValue ?? []);
  const [rejections, setRejections] = useState<FileRejection[]>([]);

  const isControlled = value !== undefined;
  const files = isControlled ? value : internalFiles;

  // Callers must invoke addFiles/removeFile at most once per user event: `next`
  // is computed from the `files` of the current render, not via a state updater,
  // so two calls before a re-render would drop the first. Validation has to see
  // the existing selection, and moving it inside a state updater would only work
  // in the uncontrolled branch — splitting the behaviour this hook exists to share.
  const commit = (next: File[]) => {
    if (!isControlled) setInternalFiles(next);
    onChange?.(next);
  };

  const addFiles = (incoming: File[]) => {
    const { accepted, rejections: rejected } = validateFiles(incoming, {
      accept,
      maxSize,
      maxFiles,
      multiple,
      existing: files,
    });

    setRejections(rejected);
    if (rejected.length > 0) onReject?.(rejected);
    if (accepted.length === 0) return;

    // Single-file mode replaces; multi-file mode appends.
    commit(multiple ? [...files, ...accepted] : accepted);
  };

  const removeFile = (index: number) => {
    setRejections([]);
    commit(files.filter((_, candidateIndex) => candidateIndex !== index));
  };

  const message =
    rejections.length === 0
      ? undefined
      : (rejectionMessage?.(rejections) ??
        deriveRejectionMessage(rejections, { maxSize, maxFiles, multiple }));

  return { files, addFiles, removeFile, rejectionMessage: message };
};

export type FieldStatus = 'default' | 'error' | 'disabled';

/** Which visual state a file control's label, border and status text take. */
export const getFieldStatus = (hasError: boolean, disabled?: boolean): FieldStatus => {
  if (hasError) return 'error';
  if (disabled) return 'disabled';
  return 'default';
};
