import { Flex, Modal as MantineModal, type ModalProps } from '@mantine/core';
import { CloseIcon } from '../../icons/CloseIcon';
import { mergeClassNames } from '../../utils';
import { IconButton } from '../IconButton';
import { header, modalCloseButton, modalHeaderTitle, padding } from './Modal.css';

export function Modal(props: Omit<ModalProps, 'withCloseButton'>) {
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
            variant="dark"
            size={'lg'}
            onClick={() => {
              onClose();
            }}
            aria-label={closeButtonProps?.['aria-label']}
          >
            <CloseIcon />
          </IconButton>
        </Flex>
        <MantineModal.Body className={padding}> {children}</MantineModal.Body>
      </MantineModal.Content>
    </MantineModal.Root>
  );
}
