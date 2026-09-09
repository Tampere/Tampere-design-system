import { Flex } from '@mantine/core';
import { useArgs } from '@storybook/client-api';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { type MouseEvent, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { CheckboxIndeterminateIcon } from '../../icons/CheckboxIndeterminateIcon';
import { Checkbox } from './Checkbox';

function SelectAllExample() {
  const [children, setChildren] = useState([true, false, false]);
  const allChecked = children.every(Boolean);
  const noneChecked = children.every((c) => !c);

  return (
    <Flex direction="column" gap="xs">
      <Checkbox
        label="Select all"
        checked={allChecked}
        indeterminate={!allChecked && !noneChecked}
        onClick={() => setChildren(children.map(() => !allChecked))}
      />
      {children.map((checked, i) => (
        <Checkbox
          key={i}
          label={`Item ${i + 1}`}
          checked={checked}
          onClick={() => setChildren(children.map((c, idx) => (idx === i ? !c : c)))}
        />
      ))}
    </Flex>
  );
}

const meta = {
  argTypes: {
    label: { control: 'text' },
    checked: { control: 'boolean' },
    disabled: { control: 'boolean' },
    onChange: { action: 'changed' },
    error: { control: 'boolean' },
    indeterminate: { control: 'boolean' },
  },
  args: {
    label: 'Label',
    checked: false,
    disabled: false,
    error: false,
    indeterminate: false,
  },
  component: Checkbox,
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: 'I agree to the terms' },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: any) => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
      // preserve original onClick if provided
      try {
        (args as any).onClick?.(e);
      } catch {}
    };
    return <Checkbox {...args} checked={checked} onClick={handleClick} />;
  },
};

export const Checked: Story = {
  args: { label: 'Checked option', checked: true },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: any) => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
      try {
        (args as any).onClick?.(e);
      } catch {}
    };
    return <Checkbox {...args} checked={checked} onClick={handleClick} />;
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;
    // Regression net: a checkbox that never receives `indeterminate` must never render as one.
    await expect(checkboxInput.indeterminate).toBe(false);
    await expect(checkboxInput.getAttribute('aria-checked')).toBeNull();

    // Keyboard-focusing a checked checkbox should render `states.focus` (see the comment on the
    // `:focus-visible` rule in Checkbox.css.ts) — currently identical to `states.default`, so this
    // is a basic sanity check, not a specificity regression net.
    await userEvent.tab();
    await expect(checkboxInput).toHaveFocus();
    const path = checkboxInput.parentElement?.querySelector('svg path');
    await expect(getComputedStyle(path as Element).fill).toBe('rgb(41, 84, 154)');
  },
};

export const Disabled: Story = {
  args: { label: 'Disabled option', disabled: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const checkboxInput = within(canvasElement).getByRole('checkbox') as HTMLInputElement;
    // Regression net: a checkbox that never receives `indeterminate` must never render as one.
    await expect(checkboxInput.indeterminate).toBe(false);
    await expect(checkboxInput.getAttribute('aria-checked')).toBeNull();
  },
};

export const Error: Story = {
  args: { label: 'Error option', error: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const path = canvas.getByRole('checkbox').parentElement?.querySelector('svg path');
    await expect(path).toBeTruthy();
    // Figma Common/Error = Red/300 (#ae1e20).
    await expect(getComputedStyle(path as Element).fill).toBe('rgb(174, 30, 32)');
  },
};

export const Indeterminate: Story = {
  args: { label: 'Indeterminate option', indeterminate: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
    const path = checkboxInput.parentElement?.querySelector('svg path');
    await expect(path).toBeTruthy();
    // Figma Primary-states/Default = Blue/400 (#29549a).
    await expect(getComputedStyle(path as Element).fill).toBe('rgb(41, 84, 154)');

    // The browser's click activation steps reset the native `indeterminate` DOM property to
    // false; while the `indeterminate` prop stays true it must be reasserted after a click.
    await userEvent.click(checkboxInput);
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
  },
};

export const IndeterminateTakesPrecedenceOverChecked: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Both set', indeterminate: true, checked: true },
  render: (args) => (
    <>
      <Checkbox {...args} />
      {/* Hidden reference render of the expected icon, so the assertion below tracks the icon's
          actual geometry instead of a path string that would silently go stale if it changed. */}
      <CheckboxIndeterminateIcon aria-hidden="true" style={{ display: 'none' }} />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
    // Indeterminate icon's dash path, not the checked icon's checkmark path.
    const [renderedIcon, referenceIcon] = canvasElement.querySelectorAll('svg');
    await expect(renderedIcon.querySelector('path:nth-of-type(2)')?.getAttribute('d')).toBe(
      referenceIcon.querySelector('path:nth-of-type(2)')?.getAttribute('d')
    );

    // The precedence must also hold across the click activation steps that reset the native
    // `indeterminate` DOM property (see the `Indeterminate` story above).
    await userEvent.click(checkboxInput);
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
  },
};

export const IndeterminateDisabled: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Disabled indeterminate', indeterminate: true, disabled: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
    const path = checkboxInput.parentElement?.querySelector('svg path:nth-of-type(2)');
    // Figma disabled state = Neutral/300 (#c9c9ce), overriding the indeterminate blue.
    await expect(getComputedStyle(path as Element).fill).toBe('rgb(201, 201, 206)');

    // A disabled native input suppresses click activation entirely — clicking must be a no-op.
    await userEvent.click(checkboxInput);
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.checked).toBe(false);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
  },
};

export const IndeterminateError: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Error indeterminate', indeterminate: true, error: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput.indeterminate).toBe(true);
    await expect(checkboxInput.getAttribute('aria-checked')).toBe('mixed');
    const path = checkboxInput.parentElement?.querySelector('svg path:nth-of-type(2)');
    // Figma error state = Red/300 (#ae1e20), overriding the indeterminate blue.
    await expect(getComputedStyle(path as Element).fill).toBe('rgb(174, 30, 32)');
  },
};

// Static docs example: a realistic partial-selection "select all" pattern at rest. Kept
// separate from the interaction-test story below so viewing it in the docs page doesn't
// trigger a `play` function that clicks through every state and lands on "all unchecked".
export const SelectAll: Story = {
  render: () => <SelectAllExample />,
};

export const SelectAllStateTransitions: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <SelectAllExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const [selectAll, item1, item2, item3] = canvas.getAllByRole('checkbox') as HTMLInputElement[];

    // Starts with only Item 1 checked: partial selection.
    await expect(selectAll.indeterminate).toBe(true);
    await expect(selectAll.checked).toBe(false);
    await expect(selectAll.getAttribute('aria-checked')).toBe('mixed');

    // Clicking "Select all" while indeterminate selects every item (not deselect).
    await userEvent.click(selectAll);
    await expect(selectAll.indeterminate).toBe(false);
    await expect(selectAll.checked).toBe(true);
    await expect(selectAll.getAttribute('aria-checked')).toBeNull();
    await expect(item1.checked).toBe(true);
    await expect(item2.checked).toBe(true);
    await expect(item3.checked).toBe(true);

    // Clicking "Select all" again while fully checked deselects every item.
    await userEvent.click(selectAll);
    await expect(selectAll.indeterminate).toBe(false);
    await expect(selectAll.checked).toBe(false);
    await expect(item1.checked).toBe(false);
    await expect(item2.checked).toBe(false);
    await expect(item3.checked).toBe(false);

    // Checking one item returns the parent to partial selection.
    await userEvent.click(item1);
    await expect(selectAll.indeterminate).toBe(true);
    await expect(selectAll.checked).toBe(false);

    // Checking the remaining items resolves the parent to fully checked.
    await userEvent.click(item2);
    await userEvent.click(item3);
    await expect(selectAll.indeterminate).toBe(false);
    await expect(selectAll.checked).toBe(true);

    // Unchecking one item returns the parent to indeterminate.
    await userEvent.click(item1);
    await expect(selectAll.indeterminate).toBe(true);
    await expect(selectAll.checked).toBe(false);

    // Unchecking all items resolves the parent to fully unchecked.
    await userEvent.click(item2);
    await userEvent.click(item3);
    await expect(selectAll.indeterminate).toBe(false);
    await expect(selectAll.checked).toBe(false);
  },
};

export const RichLabel: Story = {
  args: {
    label: (
      <span>
        Accept <strong>all</strong> cookies
      </span>
    ),
  },
  render: (args) => {
    const [, updateArgs] = useArgs();
    const checked = Boolean(args.checked);
    const handleClick = (e: any) => {
      updateArgs({ checked: !checked });
      try {
        (args as any).onChange?.(!checked);
      } catch {}
      try {
        (args as any).onClick?.(e);
      } catch {}
    };
    return <Checkbox {...args} checked={checked} onClick={handleClick} />;
  },
};

// ── Dev-warning tests (verifies #124's fix: a controlled Checkbox that only
// wires `onClick` doesn't log React's "checked without onChange" warning, and
// that a caller's own `onChange` still fires — the fix's `onChange` handler
// must forward, not swallow, it) ─────────────────────────────────────────────

// Captures console.error calls for the dev-warning test below.
let capturedConsoleErrors: string[] = [];

// The un-patched `console.error`, captured once at module scope. Deliberately *not* re-read inside
// the patch: if a story aborted mid-play (timeout, cancelled run) its cleanup would never run, and
// a second patch would then capture the previous stub as "original" — leaving `console.error`
// broken for the rest of the browser session.
const nativeConsoleError = console.error;

const captureConsoleErrors = () => {
  capturedConsoleErrors = [];
  console.error = (...messageArgs: unknown[]) => {
    capturedConsoleErrors.push(String(messageArgs[0]));
    // Still forward, so an unrelated React error raised during the story stays visible in CI
    // output instead of being swallowed by the capture.
    nativeConsoleError(...messageArgs);
  };
  return () => {
    console.error = nativeConsoleError;
  };
};

export const ControlledWithoutOnChangeDoesNotWarn: Story = {
  tags: ['!dev', '!autodocs'],
  // Rendered without spreading `args` so meta's `onChange: { action: 'changed' }` argType
  // (which auto-populates an `onChange` arg via the actions addon) can't mask the bug being
  // tested: a caller wiring only `onClick`, with no `onChange` at all, on a controlled Checkbox.
  render: () => <Checkbox label="Controlled option" checked={true} onClick={() => {}} />,
  beforeEach: captureConsoleErrors,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // React's warning (if any) logs on this initial mount render already, before the click below.
    await expect(capturedConsoleErrors.some((m) => /provided a `checked` prop/.test(m))).toBe(
      false
    );
    // ...and must stay silent across the update render a click causes, too.
    await userEvent.click(canvas.getByRole('checkbox'));
    await expect(capturedConsoleErrors.some((m) => /provided a `checked` prop/.test(m))).toBe(
      false
    );
  },
};

const onChangeSpy = fn();

export const ControlledForwardsCallerOnChange: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <Checkbox label="Controlled option" checked={false} onClick={() => {}} onChange={onChangeSpy} />
  ),
  beforeEach: () => {
    onChangeSpy.mockClear();
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('checkbox'));
    await expect(onChangeSpy).toHaveBeenCalledTimes(1);
  },
};

// ── Verifies #122's fix: an uncontrolled Checkbox (no `checked` prop at all) must not trip
// React's "Too many re-renders" limit. Rendered without spreading `args`, since meta's
// `checked: false` default would otherwise mask the bug by always providing a `checked` prop.
export const UncontrolledDoesNotExceedRerenderLimit: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <Checkbox label="Uncontrolled option" />,
  play: async ({ canvasElement }) => {
    const checkboxInput = within(canvasElement).getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput.checked).toBe(false);
    await userEvent.click(checkboxInput);
    await expect(checkboxInput.checked).toBe(true);
  },
};

// Verifies `defaultChecked` (the standard React prop for uncontrolled initial state) is honored,
// not silently dropped by the `checked`+`defaultChecked` conflict on the underlying native input.
export const UncontrolledDefaultCheckedIsHonored: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <Checkbox label="Uncontrolled option" defaultChecked />,
  play: async ({ canvasElement }) => {
    const checkboxInput = within(canvasElement).getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput.checked).toBe(true);
    await userEvent.click(checkboxInput);
    await expect(checkboxInput.checked).toBe(false);
  },
};

// Verifies #123's fix: Checkbox's label uses the same `typography.p2` body-text style as
// RadioButton's label, instead of falling back to the browser's ambient inherited font.
export const LabelUsesBodyTypography: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Body text label' },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const label = within(canvasElement).getByText('Body text label');
    const style = getComputedStyle(label);
    await expect(style.fontSize).toBe('18px');
    await expect(style.color).toBe('rgb(45, 45, 50)');
  },
};

// ── Vetoed-click tests: a caller can cancel a checkbox toggle with `preventDefault()` in its own
// `onClick`, the standard native pattern (e.g. behind a confirmation prompt). Because Checkbox
// fakes the toggle in its click handler rather than leaving it to the browser, ignoring the veto
// used to leave React state and the DOM permanently split — icon checked, input unchecked, and the
// field missing from a form submit. ────────────────────────────────────────────────────────────

const vetoClick = (e: MouseEvent<HTMLInputElement>) => e.preventDefault();

export const VetoedClickDoesNotToggle: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <Checkbox label="Uncontrolled option" onClick={vetoClick} />,
  play: async ({ canvasElement }) => {
    const checkboxInput = within(canvasElement).getByRole('checkbox') as HTMLInputElement;
    await userEvent.click(checkboxInput);
    // The DOM value the browser reverted...
    await expect(checkboxInput.checked).toBe(false);
    // ...and the internal state the icon renders from, which `data-checked` reflects.
    await expect(checkboxInput).not.toHaveAttribute('data-checked');
  },
};

export const VetoedClickPreservesIndeterminate: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <Checkbox label="Uncontrolled option" indeterminate onClick={vetoClick} />,
  play: async ({ canvasElement }) => {
    const checkboxInput = within(canvasElement).getByRole('checkbox') as HTMLInputElement;
    await userEvent.click(checkboxInput);
    // A vetoed click causes no re-render, so the effect that re-asserts `indeterminate` doesn't
    // run — the browser's canceled-activation steps have to have restored it on their own.
    await expect(checkboxInput.indeterminate).toBe(true);
  },
};

const vetoedOnChangeSpy = fn();

export const VetoedClickDoesNotFireOnChange: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <Checkbox label="Uncontrolled option" onClick={vetoClick} onChange={vetoedOnChangeSpy} />
  ),
  beforeEach: () => {
    vetoedOnChangeSpy.mockClear();
  },
  play: async ({ canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('checkbox'));
    await expect(vetoedOnChangeSpy).not.toHaveBeenCalled();
  },
};

// ── Form-reset tests: `defaultChecked` can't be forwarded to the input alongside `checked`, so
// the `checked` content attribute the browser resets from is set imperatively instead. Without it
// a reset silently unchecks the input — dropping the field from the submitted data — while the
// icon carries on rendering the pre-reset value. ───────────────────────────────────────────────

function UncontrolledResetExample() {
  return (
    <form>
      <Checkbox name="agree" label="Uncontrolled option" defaultChecked />
      <button type="reset">Reset</button>
    </form>
  );
}

export const FormResetRestoresDefaultChecked: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <UncontrolledResetExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;

    // The content attribute the browser resets from, which `defaultChecked` alone wouldn't set.
    await expect(checkboxInput.defaultChecked).toBe(true);

    await userEvent.click(checkboxInput);
    await expect(checkboxInput.checked).toBe(false);

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(async () => {
      await expect(checkboxInput.checked).toBe(true);
      // ...and the internal state resynced, so the icon matches the reset input.
      await expect(checkboxInput).toHaveAttribute('data-checked', 'true');
    });
    await expect(new FormData(checkboxInput.form!).get('agree')).toBe('on');
  },
};

function ControlledResetExample() {
  const [checked, setChecked] = useState(true);

  return (
    <form>
      <Checkbox
        name="agree"
        label="Controlled option"
        checked={checked}
        onClick={() => setChecked(!checked)}
      />
      <button type="reset">Reset</button>
    </form>
  );
}

export const FormResetKeepsControlledValue: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <ControlledResetExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;

    await userEvent.click(canvas.getByRole('button', { name: 'Reset' }));
    // The parent still says checked, so the reset must not desync the DOM from it.
    await waitFor(async () => {
      await expect(checkboxInput.checked).toBe(true);
    });
    await expect(checkboxInput).toHaveAttribute('data-checked', 'true');
  },
};
