import { Flex, Modal as MantineModal, type ModalProps } from "@mantine/core";
// import { useTranslations } from "src/hooks/useTranslations";
import { CrossIcon } from "src/icons/CrossIcon";
import {
  header,
  modalCloseButton,
  modalHeaderTitle,
  padding,
} from "./Modal.css";
import cx from "clsx";
import { IconButton } from "src/components";

export function Modal(props: Omit<ModalProps, "withCloseButton">) {
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
            size={"lg"}
            onClick={() => {
              onClose();
            }}
          // aria-label={tr("close")}
          >
            <CrossIcon />
          </IconButton>
        </Flex>
        <MantineModal.Body className={padding}> {children}</MantineModal.Body>
      </MantineModal.Content>
    </MantineModal.Root>
  );
}
