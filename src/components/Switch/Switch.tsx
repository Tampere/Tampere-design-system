import { Switch as MantineSwitch, type SwitchProps } from '@mantine/core';
import { CloseIcon } from '../../icons/CloseIcon';
import { CheckboxCheckedIcon } from '../../icons/CheckboxCheckedIcon';
import { CheckboxUncheckedIcon } from '../../icons/CheckboxUncheckedIcon';
import { vars } from '../../theme';
import { body, closeIcon, input, label, openIcon, thumb, track } from './Switch.css';

interface Props {
  onChange: SwitchProps['onChange'];
  label?: React.ReactNode;
  checked: SwitchProps['checked'];
  ariaLabel?: string;
}

export function Switch(props: Props) {
  return (
    <MantineSwitch
      classNames={{
        body: body,
        track: track,
        thumb: thumb,
        label: label,
        input: input,
      }}
      checked={props.checked}
      onChange={props.onChange}
      thumbIcon={
        <span
          style={{
            position: 'relative',
            display: 'inline-flex',
            width: '100%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {props.checked ? (
            <CheckboxCheckedIcon fill={vars.core.main} className={openIcon} />
          ) : (
            <>
              <CheckboxUncheckedIcon className={closeIcon} />
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <CloseIcon width={'14px'} height={'14px'} className={closeIcon} />
              </span>
            </>
          )}
        </span>
      }
      label={props.label}
      labelPosition="left"
      aria-label={props.ariaLabel}
    />
  );
}
