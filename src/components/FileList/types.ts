import type { AriaAttributes, CSSProperties, ReactNode } from 'react';

export type FileRejectionReason = 'type' | 'size' | 'count';

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
}

/**
 * Prop base shared by FileInput and Dropzone, so the two controls cannot
 * drift apart. Neither control participates in native form submission —
 * both reset their hidden `<input type="file">` after every pick (so
 * re-picking a removed file fires `change` again), which also clears the
 * native input's value, so a native multipart submit would post an empty
 * field regardless. Read the selection through `onChange` instead.
 */
export interface FileSelectionProps extends AriaAttributes {
  /** Explicit id for the field. Falls back to a generated id. */
  id?: string;
  className?: string;
  style?: CSSProperties;
  /**
   * Field label. Without it, supply an `aria-label` for accessibility — both
   * components wire it directly into the picker Button's accessible name
   * (kept alongside the button's own visible text, e.g. `"Liitteet Valitse
   * tiedostoja"`) rather than onto the control's outer wrapper, which has no
   * role of its own to take a name from. Ignored when `inputLabel` is set.
   */
  inputLabel?: string;
  helperText?: ReactNode;
  /** Consumer-level error (e.g. an upload failure). Takes precedence over any derived rejection message. */
  error?: string;
  disabled?: boolean;
  multiple?: boolean;
  /** Native `accept` shape: `'application/pdf'`, `'image/*'`, `'.pdf,.doc'`. */
  accept?: string;
  /** Maximum size per file, in bytes. */
  maxSize?: number;
  /** Maximum number of files. Ignored when `multiple` is false, where the limit is always 1. */
  maxFiles?: number;
  /** Controlled value. When set, the component holds no selection state of its own. */
  value?: File[];
  /** Initial value for uncontrolled use. */
  defaultValue?: File[];
  onChange?: (files: File[]) => void;
  onReject?: (rejections: FileRejection[]) => void;
  buttonLabel?: string;
  placeholder?: string;
  removeLabel?: string;
  selectedCountLabel?: (count: number) => string;
  /** Replaces the built-in Finnish rejection message wholesale. */
  rejectionMessage?: (rejections: FileRejection[]) => string;
  'data-testid'?: string;
}
