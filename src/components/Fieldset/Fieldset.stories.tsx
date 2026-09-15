import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { within, userEvent } from '@storybook/testing-library';
import { expect } from 'storybook/test';
import { Fieldset, fieldsetSelectionGroup } from './Fieldset';
import { Checkbox } from '../Checkbox/Checkbox';
import { RadioButton } from '../RadioButton/RadioButton';
import { TextField } from '../TextField/TextField';
import { Select } from '../Select/Select';
import { DateField } from '../DateField';

// Finnish translation of HDS (Helsinki Design System)'s canonical Fieldset
// example (hds.hel.fi/components/fieldset/#example), matching the Figma
// branch's "Fieldset with applicant information" example (node 14047:1146).
const applicantInfoFields = (
  <>
    <TextField inputLabel="Etunimi" />
    <TextField inputLabel="Sukunimi" />
    <TextField inputLabel="Henkilötunnus" placeholder="Esim. 111299-1234" />
  </>
);

const meta = {
  component: Fieldset,
  tags: ['!dev', '!autodocs'],
  args: {
    legend: 'Hakijan tiedot',
    'data-testid': 'fieldset',
    children: applicantInfoFields,
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

    // Recipe is Fieldset.css.ts's `legend` style — a bare <legend> otherwise
    // falls back to the browser's own small default font, not any TREDS type
    // scale.
    await expect(style.fontWeight).toBe('600');
    await expect(style.color).toBe('rgb(45, 45, 50)');
    // P2 resolves to 18px at this test viewport's breakpoint — pin the exact
    // value so a regression that picks a different (but still >=14px) type
    // scale step doesn't slip through.
    await expect(parseFloat(style.fontSize)).toBe(18);
  },
};

export const Required: Story = {
  tags: docExample,
  args: { showRequiredMarker: true },
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
    // flush/cramped rather than "<legend> *". Pin the exact
    // requiredIndicatorGap token value (4px, fixed/non-responsive) rather
    // than just "any positive gap".
    await expect(parseFloat(getComputedStyle(asterisk as Element).marginLeft)).toBe(4);
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

    // Regression: see Fieldset.css.ts's `legend` comment for why the legend
    // needs its own explicit `marginBottom` (flex `gap` doesn't reach it).
    // Assert equality against the description→children gap (both use the
    // same `forms.fieldset.spacing` token) rather than a hardcoded pixel
    // value.
    const legend = canvas.getByText('Hakijan tiedot');
    const descriptionGroup = helper.parentElement as HTMLElement;
    const childrenWrapper = descriptionGroup.nextElementSibling as HTMLElement;
    const legendToHelperGap =
      helper.getBoundingClientRect().top - legend.getBoundingClientRect().bottom;
    const descriptionToChildrenGap =
      childrenWrapper.getBoundingClientRect().top - descriptionGroup.getBoundingClientRect().bottom;

    await expect(legendToHelperGap).toBeGreaterThan(0);
    await expect(Math.abs(legendToHelperGap - descriptionToChildrenGap)).toBeLessThan(1);
  },
};

export const WithError: Story = {
  tags: docExample,
  args: { helperText: 'Ohjeteksti', error: 'Virheteksti' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });

    // Error is shown alongside helper text, not replacing it — matches
    // TextField/Mantine's InputWrapper, which renders description and error
    // together at TextField's own tighter spacing (input.spacing.verticalSpacing),
    // both wired into aria-describedby.
    const helper = canvas.getByText('Ohjeteksti');
    const error = canvas.getByText('Virheteksti');

    await expect(group).toHaveAttribute('aria-describedby', `${helper.id} ${error.id}`);
    await expect(getComputedStyle(error).color).toBe('rgb(174, 30, 32)');
    await expect(getComputedStyle(helper).color).not.toBe('rgb(174, 30, 32)');

    // Regression: helper→error gap must be the tight TextField-matching gap
    // (input.spacing.verticalSpacing, 8px at this test viewport's
    // breakpoint), strictly smaller than the looser legend→helper gap
    // (forms.fieldset.spacing) the pair sits inside. Pin the actual token
    // value, not just the ordering — a regression that swaps in some other
    // smaller-but-wrong value would still satisfy a bare inequality.
    const legend = canvas.getByText('Hakijan tiedot');
    const legendToHelperGap =
      helper.getBoundingClientRect().top - legend.getBoundingClientRect().bottom;
    const helperToErrorGap =
      error.getBoundingClientRect().top - helper.getBoundingClientRect().bottom;

    await expect(Math.abs(helperToErrorGap - 8)).toBeLessThan(1);
    await expect(helperToErrorGap).toBeLessThan(legendToHelperGap);
  },
};

export const ErrorOnlyDescribedBy: Story = {
  args: { error: 'Virheteksti' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });
    const error = canvas.getByText('Virheteksti');

    await expect(canvas.queryByText('Ohjeteksti')).toBeNull();
    await expect(group).toHaveAttribute('aria-describedby', error.id);
  },
};

export const EmptyStringErrorFallsBackToHelperText: Story = {
  args: { helperText: 'Ohjeteksti', error: '' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });

    // Regression: an empty-string `error` (common from controlled form
    // state) must not swallow `helperText` — only a truthy `error` shows.
    const helper = canvas.getByText('Ohjeteksti');
    await expect(helper).toBeVisible();
    await expect(group).toHaveAttribute('aria-describedby', helper.id);
  },
};

export const DescribedByMergesWithConsumerValue: Story = {
  args: { helperText: 'Ohjeteksti', 'aria-describedby': 'external-hint' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });
    const helper = canvas.getByText('Ohjeteksti');

    // A caller-supplied aria-describedby must be merged with, not clobbered
    // by, the internal helperText/error ids.
    await expect(group).toHaveAttribute('aria-describedby', `${helper.id} external-hint`);
  },
};

export const DescribedByFallsBackToConsumerValueWhenNoDescription: Story = {
  args: { 'aria-describedby': 'external-hint' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });

    await expect(group).toHaveAttribute('aria-describedby', 'external-hint');
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

    // Both gaps are responsive (legend-stack: 16/12, field-group: 24/16) —
    // pin both to their actual token values at this test viewport's
    // breakpoint (16px/24px) rather than only checking their relative order,
    // so a regression that swaps in some other smaller/larger value can't
    // slip through.
    const legendStackGap = a.getBoundingClientRect().top - helper.getBoundingClientRect().bottom;
    const fieldGroupGap = b.getBoundingClientRect().top - a.getBoundingClientRect().bottom;

    await expect(Math.abs(legendStackGap - 16)).toBeLessThan(1);
    await expect(Math.abs(fieldGroupGap - 24)).toBeLessThan(1);
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
    // Border/padding/radius rationale: see Fieldset.css.ts's `withBorder` comment.
    await expect(style.borderColor).toBe('rgb(82, 82, 91)');
    await expect(style.borderRadius).toBe('0px');
    await expect(style.paddingTop).toBe('0px');
    await expect(style.paddingRight).toBe('24px');
    await expect(style.paddingBottom).toBe('24px');
    await expect(style.paddingLeft).toBe('24px');

    // Regression: the gap from the legend to the first content below it must
    // match the fieldset's normal legend-stack gap (`forms.fieldset.spacing`,
    // the same value `root`'s own flex `rowGap` resolves to) — see
    // Fieldset.css.ts's `withBorder` comment for why `paddingTop: 0` above
    // matters here.
    const legend = canvas.getByText('Hakijan tiedot');
    const firstField = canvas.getByText('Etunimi');
    const fieldset = canvas.getByTestId('fieldset');
    const gapAfterLegend =
      firstField.getBoundingClientRect().top - legend.getBoundingClientRect().bottom;
    const legendStackGapToken = parseFloat(getComputedStyle(fieldset).rowGap);

    await expect(Math.abs(gapAfterLegend - legendStackGapToken)).toBeLessThan(1);
  },
};

export const WithoutBorderHasNoPadding: Story = {
  // Figma's default Fieldset (per #70) has no border and no padding — must
  // not gain padding just because `withBorder`'s style exists in the CSS.
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(getComputedStyle(canvas.getByTestId('fieldset')).padding).toBe('0px');
  },
};

export const WithCheckboxGroup: Story = {
  tags: docExample,
  args: {
    legend: 'Minulle sopivimmat työskentelypäivät',
    showRequiredMarker: true,
    helperText: 'Valitse päivät, jotka useimmiten sopivat',
  },
  // Checkbox is a controlled component with its own internal state, toggled
  // via `onClick` (not `onChange` — see Checkbox.stories.tsx's own
  // convention) — a story-local `useState` is required for the checkboxes to
  // actually respond to clicks, not just render a static unchecked snapshot.
  // Grouped as a single Fieldset child (via `fieldsetSelectionGroup`) so the items
  // get their own dedicated "Selection-items-spacing" gap token, not the
  // larger field-group gap meant for stacking distinct field types.
  render: (args) => {
    const days = ['Maanantai', 'Tiistai', 'Keskiviikko', 'Torstai', 'Perjantai'];
    const [checked, setChecked] = useState(days.map(() => false));

    return (
      <Fieldset {...args}>
        <div data-testid="checkbox-group" className={fieldsetSelectionGroup}>
          {days.map((label, i) => (
            <Checkbox
              key={label}
              label={label}
              checked={checked[i]}
              onClick={() => setChecked(checked.map((c, idx) => (idx === i ? !c : c)))}
            />
          ))}
        </div>
      </Fieldset>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const checkboxes = canvas.getAllByRole('checkbox');

    await expect(checkboxes).toHaveLength(5);

    // Regression: checkboxes must actually respond to clicks (the earlier
    // static `checked={false}` demo looked right but was unclickable —
    // Checkbox's own render-phase `checked`/prop-sync logic immediately
    // reverted any click back to the hardcoded `false`).
    const first = checkboxes[0] as HTMLInputElement;
    await expect(first.checked).toBe(false);
    await userEvent.click(first);
    await expect(first.checked).toBe(true);

    // Regression: checkbox items must use the tighter `selectionItemsSpacing`
    // gap (16px at this test viewport's breakpoint), not `fieldGroupSpacing`
    // (24px, the larger gap meant for stacking distinct field types) —
    // compared against the actual field-group gap (the checkbox group's own
    // parent, Fieldset's `childrenWrapper`). Pin both exact values, not just
    // their order, so this survives `selectionItemsSpacing` and `spacing`
    // diverging from each other later, which is the whole point of giving
    // them separate tokens.
    const checkboxGroup = canvas.getByTestId('checkbox-group');
    const fieldGroupGap = parseFloat(
      getComputedStyle(checkboxGroup.parentElement as HTMLElement).rowGap
    );
    const groupGap = parseFloat(getComputedStyle(checkboxGroup).rowGap);

    await expect(groupGap).toBe(16);
    await expect(fieldGroupGap).toBe(24);
  },
};

export const WithRadioGroup: Story = {
  tags: docExample,
  args: {
    legend: 'Minulle sopivin työskentelypaikka',
    showRequiredMarker: true,
    helperText: 'Voit vaihtaa valintaa myöhemmin uudelleen',
  },
  // RadioButton is fully controlled (no internal state of its own) — a
  // story-local `useState` drives mutual exclusivity, matching
  // RadioButton.stories.tsx's own `onClick`-driven convention.
  render: (args) => {
    const options = [
      { value: 'office', label: 'Toimistolla' },
      { value: 'remote', label: 'Etänä' },
      { value: 'hybrid', label: 'Hybridi' },
    ];
    const [selected, setSelected] = useState<string>();

    return (
      <Fieldset {...args}>
        <div data-testid="radio-group" className={fieldsetSelectionGroup}>
          {options.map((option) => (
            <RadioButton
              key={option.value}
              name="workplace"
              label={option.label}
              checked={selected === option.value}
              onClick={() => setSelected(option.value)}
            />
          ))}
        </div>
      </Fieldset>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio') as HTMLInputElement[];

    await expect(radios).toHaveLength(3);

    // Regression: radios must actually respond to clicks and stay mutually
    // exclusive (the earlier demo passed neither `checked` nor `onClick` at
    // all, so nothing happened on click).
    await userEvent.click(radios[0]);
    await expect(radios[0].checked).toBe(true);
    await userEvent.click(radios[1]);
    await expect(radios[1].checked).toBe(true);
    await expect(radios[0].checked).toBe(false);

    // Regression: same gap check as WithCheckboxGroup.
    const radioGroup = canvas.getByTestId('radio-group');
    const fieldGroupGap = parseFloat(
      getComputedStyle(radioGroup.parentElement as HTMLElement).rowGap
    );
    const groupGap = parseFloat(getComputedStyle(radioGroup).rowGap);

    await expect(groupGap).toBe(16);
    await expect(fieldGroupGap).toBe(24);
  },
};

export const WithMixedInputs: Story = {
  tags: docExample,
  args: {
    legend: 'Yhteydenottopyyntö',
    showRequiredMarker: true,
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

export const WithoutChildrenRendersNoWrapper: Story = {
  args: { children: undefined },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const group = canvas.getByRole('group', { name: 'Hakijan tiedot' });

    // No wrapper div should render when there are no children to group —
    // the fieldset's only DOM child is its own <legend>.
    await expect(group.children).toHaveLength(1);
  },
};

export const CustomClassNamesMergeWithInternalStyles: Story = {
  args: { classNames: { legend: 'consumer-legend-class' } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const legend = canvas.getByText('Hakijan tiedot');

    // A caller's classNames.legend must merge with (cx), not replace, the
    // internal legend typography class.
    await expect(legend.className).toContain('consumer-legend-class');
    await expect(getComputedStyle(legend).fontWeight).toBe('600');
  },
};
