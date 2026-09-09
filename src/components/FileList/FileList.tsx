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
}

/** Renders selected files as removable rows. Stateless — the owner holds the files. */
export const FileList = ({
  files,
  onRemove,
  removeLabel = 'Poista tiedosto',
  disabled,
  className,
  ...props
}: FileListProps) => {
  if (files.length === 0) return null;

  return (
    <ul className={cx(list, className)} {...props}>
      {files.map((file, index) => (
        <li key={`${file.name}-${file.size}-${file.lastModified}`} className={row}>
          <span className={nameStyle}>{file.name}</span>
          <IconButton
            size="sm"
            variant="default"
            disabled={disabled}
            aria-label={`${removeLabel}: ${file.name}`}
            onClick={() => onRemove(index)}
          >
            <CloseIcon />
          </IconButton>
        </li>
      ))}
    </ul>
  );
};
