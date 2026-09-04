import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, waitFor } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Fieldset } from './Fieldset';
import { Checkbox } from '../Checkbox/Checkbox';
import { RadioButton } from '../RadioButton/RadioButton';
import { TextField } from '../TextField/TextField';
import { Select } from '../Select/Select';
import { DateField } from '../DateField';

const meta = {
  component: Fieldset,
  tags: ['!dev', '!autodocs'],
  args: {
    legend: 'Hakijan tiedot',
    'data-testid': 'fieldset',
  },
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

const docExample = ['dev', 'autodocs'];

export const Default: Story = {
  tags: docExample,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });

    await expect(group.tagName).toBe('FIELDSET');
  },
};

export const LegendUsesInputLabelTypography: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legend = canvas.getByText('Hakijan tiedot');
    const style = getComputedStyle(legend);

    // Same recipe as TextField's own label (TextField.css.ts): Figma's "Inputs
    // and forms/Input label" style — P2 size, Subheader/Semi-Bold weight,
    // text.primary color. A bare <legend> otherwise falls back to the
    // browser's own small default legend font, not any TREDS type scale.
    await expect(style.fontWeight).toBe('600');
    await expect(style.color).toBe('rgb(45, 45, 50)');
    await expect(parseFloat(style.fontSize)).toBeGreaterThanOrEqual(14);
  },
};

export const Required: Story = {
  tags: docExample,
  args: { required: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The visual asterisk is decorative (aria-hidden) — the accessible name
    // stays just the legend text, since `required` isn't a native `<fieldset>`
    // concept; individual inputs inside carry their own `required` attribute.
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });
    const asterisk = group.querySelector('[aria-hidden="true"]');

    await expect(asterisk?.textContent).toBe('*');
    await expect(getComputedStyle(asterisk as Element).color).toBe('rgb(174, 30, 32)');
    // Visual gap from the legend text — without it, "<legend>*" reads as
    // flush/cramped rather than "<legend> *".
    await expect(parseFloat(getComputedStyle(asterisk as Element).marginLeft)).toBeGreaterThan(0);
  },
};

export const WithHelperText: Story = {
  tags: docExample,
  args: { helperText: 'Ohjeteksti' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });
    const helper = canvas.getByText('Ohjeteksti');

    await expect(group).toHaveAttribute('aria-describedby', helper.id);
  },
};

export const WithError: Story = {
  tags: docExample,
  args: { helperText: 'Ohjeteksti', error: 'Virheteksti' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });

    // Error replaces helper text, matching TextField's error/helperText convention
    await expect(canvas.queryByText('Ohjeteksti')).toBeNull();
    const error = canvas.getByText('Virheteksti');
    await expect(group).toHaveAttribute('aria-describedby', error.id);
    await expect(getComputedStyle(error).color).toBe('rgb(174, 30, 32)');
  },
};

export const MultipleChildrenAreSpaced: Story = {
  args: {
    helperText: 'Ohjeteksti',
    children: (
      <>
        <div data-testid="field-a" style={{ height: 20 }} />
        <div data-testid="field-b" style={{ height: 20 }} />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const helper = canvas.getByText('Ohjeteksti');
    const a = canvas.getByTestId('field-a');
    const b = canvas.getByTestId('field-b');

    // Both gaps are responsive (legend-stack: 16/12, field-group: 24/16), so
    // don't assume which breakpoint tier the test viewport lands on — instead
    // assert the relationship that holds at every tier: the gap between two
    // distinct fields must be strictly larger than the tighter legend-stack
    // gap (helper text → first field), proving they're driven by two
    // different tokens rather than one gap value applied uniformly.
    const legendStackGap = a.getBoundingClientRect().top - helper.getBoundingClientRect().bottom;
    const fieldGroupGap = b.getBoundingClientRect().top - a.getBoundingClientRect().bottom;

    await expect(fieldGroupGap).toBeGreaterThan(legendStackGap);
  },
};

export const WithoutBorderByDefault: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const style = getComputedStyle(canvas.getByTestId('fieldset'));

    // Figma's default Fieldset (per #70) has no visible border — this is the
    // opt-in Mantine-style bordered variant added on top of that.
    await expect(style.borderStyle).toBe('none');
  },
};

export const WithBorder: Story = {
  tags: docExample,
  args: { withBorder: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const style = getComputedStyle(canvas.getByTestId('fieldset'));

    await expect(style.borderStyle).toBe('solid');
    await expect(style.borderWidth).toBe('2px');
    await expect(style.borderColor).toBe('rgb(222, 222, 226)');
    // Default radius is 'sharp' — matches Paper's own default.
    await expect(style.borderRadius).toBe('0px');
  },
};

export const WithBorderAndPillRadius: Story = {
  tags: docExample,
  args: { withBorder: true, radius: 'pill' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('fieldset')).borderRadius).toBe('9999px');
  },
};

export const RadiusIgnoredWithoutBorder: Story = {
  // `radius` only affects the bordered variant's corners — must not leak a
  // pill radius onto the borderless default Fieldset.
  args: { radius: 'pill' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('fieldset')).borderRadius).toBe('0px');
  },
};

export const WithCheckboxGroup: Story = {
  tags: docExample,
  args: {
    legend: 'Minulle sopivimmat työskentelypäivät',
    required: true,
    helperText: 'Valitse päivät, jotka useimmiten sopivat',
    // Checkbox is a controlled component — always pass `checked` explicitly
    // (see Checkbox.stories.tsx's own convention).
    children: (
      <>
        <Checkbox label="Maanantai" checked={false} onChange={() => {}} />
        <Checkbox label="Tiistai" checked={false} onChange={() => {}} />
        <Checkbox label="Keskiviikko" checked={false} onChange={() => {}} />
        <Checkbox label="Torstai" checked={false} onChange={() => {}} />
        <Checkbox label="Perjantai" checked={false} onChange={() => {}} />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('checkbox')).toHaveLength(5);
  },
};

export const WithRadioGroup: Story = {
  tags: docExample,
  args: {
    legend: 'Minulle sopivin työskentelypaikka',
    required: true,
    helperText: 'Voit vaihtaa valintaa myöhemmin uudelleen',
    children: (
      <>
        <RadioButton name="workplace" label="Toimistolla" />
        <RadioButton name="workplace" label="Etänä" />
        <RadioButton name="workplace" label="Hybridi" />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getAllByRole('radio')).toHaveLength(3);
  },
};

export const WithMixedInputs: Story = {
  tags: docExample,
  args: {
    legend: 'Yhteydenottopyyntö',
    required: true,
    helperText: 'Täytä tiedot, niin olemme sinuun yhteydessä',
    children: (
      <>
        <TextField inputLabel="Nimi" />
        <Select inputLabel="Yhteydenottotapa" options={['Puhelin', 'Sähköposti']} />
        <DateField
          label="Toivottu ajankohta"
          calendarButtonLabel="Avaa kalenteri"
          prevMonthLabel="Edellinen kuukausi"
          nextMonthLabel="Seuraava kuukausi"
        />
      </>
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const fields = [
      canvas.getByRole('textbox', { name: 'Nimi' }),
      canvas.getByRole('textbox', { name: 'Yhteydenottotapa' }),
    ];

    // Each field keeps its own label — unlike a single-field Fieldset, a
    // mixed group can't rely on the legend to disambiguate which is which.
    for (const field of fields) {
      await expect(field).toBeVisible();
    }
  },
};

export const WithCustomClassName: Story = {
  args: { className: 'consumer-custom-class' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByTestId('fieldset').className).toContain('consumer-custom-class');
  },
};

// ── Dev-warning test (verifies the console.error guard in Fieldset.tsx) ────

let capturedConsoleErrors: string[] = [];

const captureConsoleErrors = () => {
  capturedConsoleErrors = [];
  const original = console.error;
  console.error = (...messageArgs: unknown[]) => {
    capturedConsoleErrors.push(String(messageArgs[0]));
  };
  return () => {
    console.error = original;
  };
};

export const WarnsOnInvalidRadius: Story = {
  args: { radius: 'invalid' as never },
  beforeEach: captureConsoleErrors,
  play: async () => {
    await waitFor(() =>
      expect(capturedConsoleErrors.some((m) => /invalid `radius` value/.test(m))).toBe(true)
    );
  },
};
