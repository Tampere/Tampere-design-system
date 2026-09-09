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
    // `getInputVariant` emits exactly one `data-*` attribute, so this is the only place the
    // indeterminate-over-checked precedence is observable to consumer CSS and test hooks.
    await expect(checkboxInput).toHaveAttribute('data-indeterminate', 'true');
    await expect(checkboxInput).not.toHaveAttribute('data-checked');
    // Indeterminate icon's dash path, not the checked icon's checkmark path. Asserted non-null
    // first: both sides use `?.`, so an icon refactor down to a single path would otherwise leave
    // this comparing `undefined` to `undefined` and passing vacuously.
    const [renderedIcon, referenceIcon] = canvasElement.querySelectorAll('svg');
    const renderedDash = renderedIcon.querySelector('path:nth-of-type(2)')?.getAttribute('d');
    await expect(renderedDash).toBeTruthy();
    await expect(renderedDash).toBe(
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

// `getInputVariant` emits a single `data-*` attribute with the precedence error > disabled >
// indeterminate > checked, so the CSS can't act as a backstop — that JS ordering is the whole
// contract. These two cover the composites a consumer actually hits: a pre-checked disabled
// consent box, and a checked box inside an errored fieldset.
export const DisabledChecked: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Disabled checked', checked: true, disabled: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const checkboxInput = within(canvasElement).getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput).toHaveAttribute('data-disabled', 'true');
    await expect(checkboxInput).not.toHaveAttribute('data-checked');
    const path = checkboxInput.parentElement?.querySelector('svg path:nth-of-type(2)');
    // Figma disabled state = Neutral/300 (#c9c9ce), overriding the checked blue.
    await expect(getComputedStyle(path as Element).fill).toBe('rgb(201, 201, 206)');
  },
};

export const ErrorChecked: Story = {
  tags: ['!dev', '!autodocs'],
  args: { label: 'Error checked', checked: true, error: true },
  render: (args) => <Checkbox {...args} />,
  play: async ({ canvasElement }) => {
    const checkboxInput = within(canvasElement).getByRole('checkbox') as HTMLInputElement;
    await expect(checkboxInput).toHaveAttribute('data-error', 'true');
    await expect(checkboxInput).not.toHaveAttribute('data-checked');
    const path = checkboxInput.parentElement?.querySelector('svg path:nth-of-type(2)');
    // Figma error state = Red/300 (#ae1e20), overriding the checked blue.
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

    // Positive control first. Every assertion below is of the form "no captured error matches",
    // which an empty array satisfies — so without this the story would report green if the patch
    // never applied, if `beforeEach` were dropped, or if React reworded the message. Prove the
    // capture is live before trusting its silence.
    const sentinel = 'checkbox-capture-sentinel';
    console.error(sentinel);
    await expect(capturedConsoleErrors).toContain(sentinel);

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
    // Forwarded with the event, not called bare: the handler has to pass its argument through.
    await expect(onChangeSpy).toHaveBeenCalledWith(
      expect.objectContaining({ target: within(canvasElement).getByRole('checkbox') })
    );
  },
};

// ── Verifies #122's fix: an uncontrolled Checkbox (no `checked` prop at all) must not trip
// React's "Too many re-renders" limit. Rendered without spreading `args`, since meta's
// `checked: false` default would otherwise mask the bug by always providing a `checked` prop.
export const UncontrolledDoesNotExceedRerenderLimit: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <Checkbox label="Uncontrolled option" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Queried by accessible name, not bare role: the input carries no `aria-label`, so its whole
    // name comes from the `htmlFor`/`id` pairing. A bare `getByRole('checkbox')` matches a
    // nameless input just as happily, and addon-a11y runs with `test: 'todo'`.
    const checkboxInput = canvas.getByRole('checkbox', {
      name: 'Uncontrolled option',
    }) as HTMLInputElement;
    await expect(checkboxInput.checked).toBe(false);
    await userEvent.click(checkboxInput);
    await expect(checkboxInput.checked).toBe(true);
    // The same pairing is what makes the label clickable.
    await userEvent.click(canvas.getByText('Uncontrolled option'));
    await expect(checkboxInput.checked).toBe(false);
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
    // 18px is `typography.p2` at lg and up; it is 16px at md and 14px below that. The browser-mode
    // runner has no pinned viewport, so this rides on Playwright's 1280 default — see issue #126.
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

// ── Form-reset tests. These drive the Reset button with Vitest's browser-mode `userEvent`, which
// issues a real CDP click, instead of the `storybook/test` one, which dispatches from JS. The
// distinction is the whole point: the reset event fires before the browser restores control
// values, and after a listener invoked from a *browser-originated* dispatch returns, the microtask
// checkpoint runs before that restore too. A synthetic click keeps JS on the stack and hides that
// ordering entirely — under `storybook/test` these stories pass against a Checkbox whose reset
// sync is a `queueMicrotask`, which is broken for every real user.
//
// `vitest/browser` only resolves inside browser-mode test runs, so it is imported dynamically and
// these stories are hidden from the Storybook dev sidebar. ─────────────────────────────────────

const trustedUserEvent = async () => (await import('vitest/browser')).userEvent;

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
    const click = await trustedUserEvent();
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;

    // The content attribute the browser resets from. React derives this one from the `checked`
    // prop, which the component seeds from `defaultChecked` — so this is a precondition for the
    // reset below, not a net for the `defaultChecked` effect (that effect only carries a *later*
    // change through).
    await expect(checkboxInput.defaultChecked).toBe(true);

    await click.click(checkboxInput);
    await expect(checkboxInput.checked).toBe(false);

    await click.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(async () => {
      await expect(checkboxInput.checked).toBe(true);
      // ...and the internal state resynced, so the icon matches the reset input.
      await expect(checkboxInput).toHaveAttribute('data-checked', 'true');
    });
    await expect(new FormData(checkboxInput.form!).get('agree')).toBe('on');
  },
};

function LateFormExample() {
  const [formRendered, setFormRendered] = useState(false);

  return (
    <>
      <Checkbox name="agree" label="Uncontrolled option" defaultChecked form="late-form" />
      <button type="button" onClick={() => setFormRendered(true)}>
        Add form
      </button>
      {formRendered && (
        <form id="late-form">
          <button type="reset">Reset</button>
        </form>
      )}
    </>
  );
}

// Form membership follows the `form` attribute, so a Checkbox can join a form well after it
// mounts — a modal or wizard step whose `<form>` renders later. Resolving `input.form` once when
// the reset listener subscribes would leave this Checkbox permanently unsynced, with no signal.
export const FormResetWorksWhenFormMountsLater: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <LateFormExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const click = await trustedUserEvent();
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;

    // No form exists yet at mount.
    await expect(checkboxInput.form).toBeNull();

    await click.click(checkboxInput);
    await expect(checkboxInput.checked).toBe(false);

    await click.click(canvas.getByRole('button', { name: 'Add form' }));
    await expect(checkboxInput.form).not.toBeNull();

    await click.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(async () => {
      await expect(checkboxInput.checked).toBe(true);
      await expect(checkboxInput).toHaveAttribute('data-checked', 'true');
    });
  },
};

function ChangingDefaultCheckedExample() {
  const [initiallyAgreed, setInitiallyAgreed] = useState(true);

  return (
    <form>
      <Checkbox name="agree" label="Uncontrolled option" defaultChecked={initiallyAgreed} />
      <button type="button" onClick={() => setInitiallyAgreed(false)}>
        Change default
      </button>
      <button type="reset">Reset</button>
    </form>
  );
}

// React applies `defaultChecked` only while `checked` is absent, and this component always passes
// `checked` — so a `defaultChecked` that changes after mount reaches the DOM only via the effect
// that writes the property imperatively. Without it the reset below restores the mount-time value.
export const FormResetUsesLatestDefaultChecked: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => <ChangingDefaultCheckedExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const click = await trustedUserEvent();
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;

    await expect(checkboxInput.defaultChecked).toBe(true);

    await click.click(canvas.getByRole('button', { name: 'Change default' }));
    await expect(checkboxInput.defaultChecked).toBe(false);
    // The live value is untouched by a change of default; only a reset consults it.
    await expect(checkboxInput.checked).toBe(true);

    await click.click(canvas.getByRole('button', { name: 'Reset' }));
    await waitFor(async () => {
      await expect(checkboxInput.checked).toBe(false);
      await expect(checkboxInput).not.toHaveAttribute('data-checked');
    });
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
    const click = await trustedUserEvent();
    const checkboxInput = canvas.getByRole('checkbox') as HTMLInputElement;

    // A controlled Checkbox passes no `defaultChecked`, so the reset baseline is the one React
    // derived from `checked` at mount. The `defaultChecked` effect must leave it alone rather
    // than clearing it.
    await expect(checkboxInput.defaultChecked).toBe(true);

    // Move the parent off its initial value first, so the assertions below can't be satisfied by
    // a reset that simply never happened.
    await click.click(checkboxInput);
    await expect(checkboxInput.checked).toBe(false);
    await expect(checkboxInput).not.toHaveAttribute('data-checked');

    await click.click(canvas.getByRole('button', { name: 'Reset' }));
    // The parent still says unchecked, so the reset must not desync the DOM from it — including
    // by restoring the `checked` content attribute React derived at mount.
    await waitFor(async () => {
      await expect(checkboxInput.checked).toBe(false);
    });
    await expect(checkboxInput).not.toHaveAttribute('data-checked');
  },
};
