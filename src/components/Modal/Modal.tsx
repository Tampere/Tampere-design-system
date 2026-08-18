import { Flex, Modal as MantineModal, type ModalProps as MantineModalProps } from '@mantine/core';
import { CloseIcon } from '../../icons/CloseIcon';
import { mergeClassNames } from '../../utils';
import { IconButton } from '../IconButton';
import { header, modalCloseButton, modalHeaderTitle, padding } from './Modal.css';

export interface ModalProps extends Omit<
  MantineModalProps,
  'withCloseButton' | 'closeButtonProps'
> {
  // Only 'aria-label' is ever read from this prop below — the full Mantine
  // CloseButtonProps shape isn't forwarded to the rendered IconButton, so the
  // type is narrowed to what's actually used. Required (not optional): this
  // component always renders a close button, so it must always have an
  // accessible name (see #94 — Modal shipped with no fallback label, so
  // consumers who omitted this prop got an axe-critical button-name
  // violation).
  closeButtonProps: { 'aria-label': string };
}

export function Modal(props: ModalProps) {
  const { classNames, title, children, onClose, closeButtonProps, ...rest } = props;

  const defaultClassNames = {
    title: modalHeaderTitle,
    close: modalCloseButton,
  };

  return (
    <MantineModal.Root
      onClose={onClose}
      {...rest}
      classNames={{ ...mergeClassNames(defaultClassNames, classNames) }} // Spread to tell typescript an object is always returned
    >
      <MantineModal.Overlay />
      <MantineModal.Content>
        <Flex className={header}>
          <MantineModal.Title>{title}</MantineModal.Title>
          <IconButton
            variant="default"
            size={'lg'}
            onClick={() => {
              onClose();
            }}
            aria-label={closeButtonProps['aria-label']}
          >
            <CloseIcon />
          </IconButton>
        </Flex>
        <MantineModal.Body className={padding}> {children}</MantineModal.Body>
      </MantineModal.Content>
    </MantineModal.Root>
  );
}
