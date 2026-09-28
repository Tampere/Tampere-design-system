import { useEffect, useRef } from 'react';
import cx from 'clsx';
import { CloseIcon } from '../../icons/CloseIcon.tsx';
import { IconButton } from '../IconButton/IconButton.tsx';
import { list, name as nameStyle, row } from './FileList.css.ts';

export interface FileListProps {
  files: File[];
  /** Called with the index of the file to remove. */
  onRemove: (index: number) => void;
  /** Prefixed onto each row's accessible button name, as `${removeLabel}: ${file.name}`. */
  removeLabel?: string;
  disabled?: boolean;
  className?: string;
  'data-testid'?: string;
  /**
   * Called when a removal leaves the list empty. FileList is stateless and
   * has no picker Button of its own to return focus to — the owner takes
   * over so a keyboard/SR user isn't dropped back to `<body>`.
   */
  onEmptied?: () => void;
}

/** Renders selected files as removable rows. Stateless — the owner holds the files. */
export const FileList = ({
  files,
  onRemove,
  removeLabel = 'Poista tiedosto',
  disabled,
  className,
  onEmptied,
  ...props
}: FileListProps) => {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // A ref, not state: it only needs to survive until the effect below reads
  // it after the owner's re-render — reading/clearing it shouldn't itself
  // trigger a render.
  const pendingFocusIndex = useRef<number | null>(null);

  // Runs after the owner has re-rendered with the row gone: rows below the
  // removed one have shifted up, so the button now at `pendingFocusIndex` is
  // the *next* row; falling back one index lands on the *previous* row when
  // the removed row was last. If neither exists the list is now empty —
  // FileList has no picker Button of its own to focus, so `onEmptied` hands
  // that back to the owner.
  useEffect(() => {
    const index = pendingFocusIndex.current;
    if (index === null) return;
    const target = buttonRefs.current[index] ?? buttonRefs.current[index - 1];
    pendingFocusIndex.current = null;
    if (target) {
      target.focus();
    } else {
      onEmptied?.();
    }
  }, [files, onEmptied]);

  if (files.length === 0) return null;

  return (
    <ul className={cx(list, className)} {...props}>
      {files.map((file, index) => (
        <li key={`${file.name}-${file.size}-${file.lastModified}`} className={row}>
          <span className={nameStyle}>{file.name}</span>
          <IconButton
            ref={(el: HTMLButtonElement | null) => {
              buttonRefs.current[index] = el;
            }}
            size="sm"
            variant="default"
            disabled={disabled}
            aria-label={`${removeLabel}: ${file.name}`}
            onClick={() => {
              pendingFocusIndex.current = index;
              onRemove(index);
            }}
          >
            <CloseIcon />
          </IconButton>
        </li>
      ))}
    </ul>
  );
};
