import cx from 'clsx';
import { Flex, Modal as MantineModal, type ModalProps } from '@mantine/core';
import { CloseIcon } from '../../icons/CloseIcon';
import { IconButton } from '../IconButton';
import { header, modalCloseButton, modalHeaderTitle, padding } from './Modal.css';

export function Modal(props: Omit<ModalProps, 'withCloseButton'>) {
  // const { tr } = useTranslations();
  const { classNames, title, children, onClose, ...rest } = props;

  return (
    <MantineModal.Root
      onClose={onClose}
      {...rest}
      classNames={{
        ...classNames,
        title: cx(classNames?.title, modalHeaderTitle),
        close: cx(classNames?.close, modalCloseButton),
      }}
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
            // aria-label={tr("close")}
          >
            <CloseIcon />
          </IconButton>
        </Flex>
        <MantineModal.Body className={padding}> {children}</MantineModal.Body>
      </MantineModal.Content>
    </MantineModal.Root>
  );
}
