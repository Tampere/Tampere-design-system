# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) (pre-1.0: breaking changes bump the minor version).

## [0.9.0] - 2026-09-10

### Upgrade notes

- **Breaking: `Button`'s `variant` prop renamed `filled`/`outlined`/`text` → `primary`/`secondary`/`tertiary`**, to name the variants by intent rather than visual treatment ([#73](https://github.com/Tampere/Tampere-design-system/issues/73)).

  | Old                  | New                   |
  | -------------------- | --------------------- |
  | `variant="filled"`   | `variant="primary"`   |
  | `variant="outlined"` | `variant="secondary"` |
  | `variant="text"`     | `variant="tertiary"`  |

- **Breaking: `vars.theme.cornerRadius` changed shape from a single value to `{ sharp, rounded }`.** Feeds `Button`'s new `radius` prop (see below). If you referenced `vars.theme.cornerRadius` directly (uncommon — most consumers only use component props), update to `vars.theme.cornerRadius.sharp` for the previous value ([#73](https://github.com/Tampere/Tampere-design-system/issues/73)).
- **Breaking: `SearchField`'s `searchButtonLabel` prop is now required.** Previously optional with no fallback, so an omitted label shipped an icon-only search trigger button with no accessible name — an axe-critical `button-name` violation, the same class of gap `Modal`/`Pagination` had in 0.8.0. Pass `searchButtonLabel="..."` explicitly ([#73](https://github.com/Tampere/Tampere-design-system/issues/73)).

### Added

- **`TextLink`** — a standalone text link, sized across the full `Typography` scale (`h1`–`caption`) so it can be styled inline or as a heading-sized clickable element. Supports `openExternal` (adds an external-link icon and opens in a new tab), `visited` link coloring, and a `renderLink` render-prop for router integration. Exports `TextLink`, `TextLinkProps`, `TextLinkSize` ([#49](https://github.com/Tampere/Tampere-design-system/issues/49)).
- **`Chip`** — a compact filter/selection or removable tag control. `checked`/`onChange` for the filter role (optionally with a leading icon or a custom `selectedIcon`), or `onRemove`/`removeLabel` for a dismissible tag — never both, enforced by the prop type. Exports `Chip`, `ChipProps` ([#51](https://github.com/Tampere/Tampere-design-system/issues/51)).
- **`Paper`** — a base surface container (background, border, shadow, corner radius, padding), the building block behind `Card`/`Linkbox` below and a candidate base for other surfaces going forward. `background` accepts `default`/`turquoise`/`blue`/`pink`. Exports `Paper`, `PaperProps` ([#74](https://github.com/Tampere/Tampere-design-system/issues/74)).
- **`Card`** — a static content tile built on `Paper`: `title` (required), optional `eyebrow`/`media`/`actions`/free-form `children`. `media` supports `top` or `left` placement, cropped to fill its frame. A static container only — no built-in click behavior; see `Linkbox` for a whole-card link. Exports `Card`, `CardProps` ([#57](https://github.com/Tampere/Tampere-design-system/issues/57)).
- **`Linkbox`** — a card-shaped single-destination link (`title`, optional `eyebrow`/`description`/`media`, `external` for a new-tab link with an external-icon swap). Composes `Paper` directly with `component="a"` (or a custom router component via the polymorphic `component` prop). Exports `Linkbox`, `LinkboxProps` ([#75](https://github.com/Tampere/Tampere-design-system/issues/75)).
- `Button` gains a `radius?: 'sharp' | 'pill'` prop (default `'sharp'`, non-breaking) for a fully rounded pill shape, and an `iconOnly?: boolean` prop for uniform padding with no label — `aria-label` becomes a required, compiler-enforced field when `iconOnly` is set ([#73](https://github.com/Tampere/Tampere-design-system/issues/73)).
- `Select`'s `options` prop now also accepts a grouped shape, `{ group: string; items: string[] }[]`, rendered under group headers similar to native `<optgroup>` — alongside the existing flat `string[]` ([#103](https://github.com/Tampere/Tampere-design-system/issues/103)).
- `Checkbox` now takes an `indeterminate` prop, which takes precedence over `checked` for both the rendered icon and `aria-checked` (`"mixed"`), matching native `input.indeterminate` semantics. Reuses the existing checked-state color tokens — no new tokens ([#118](https://github.com/Tampere/Tampere-design-system/issues/118)).

### Changed

- **A keyboard-focused `Checkbox` or `RadioButton` that is being pressed now paints the pressed fill rather than the focus fill.** Affects unchecked controls only; a checked one's fill already won over both. The `:focus-visible` and `:active` rules tie in specificity, and both components previously declared `:active` first, so focus won. Changed so pressing reads as pressed ([#118](https://github.com/Tampere/Tampere-design-system/issues/118)).
- **A keyboard-focused `Checkbox` or `RadioButton` now keeps its focus fill when hovered**, instead of darkening to the hover fill. Both gain a checked-state `:focus-visible` rule they previously lacked. `states.focus` and `states.default` are currently the same color, so this is only visible on a checked or indeterminate control, where hover previously darkened it ([#118](https://github.com/Tampere/Tampere-design-system/issues/118)).
- **A `Checkbox` that is both `disabled` and `error` now renders as disabled rather than as an error.** Previously the error red won for the icon while the label greyed out regardless, rendering the control half-disabled. A control the user cannot interact with should read as inert rather than as something they are being asked to fix. `RadioButton` still resolves this pair the other way; see [#137](https://github.com/Tampere/Tampere-design-system/issues/137) ([#118](https://github.com/Tampere/Tampere-design-system/issues/118)).

### Fixed

- `Select`'s dropdown list now scrolls instead of clipping once it has more options than fit its max height ([#102](https://github.com/Tampere/Tampere-design-system/issues/102)).
- **`Checkbox` inside a `<form>` no longer desyncs from the DOM when the user resets the form.** The internal state resynced on a microtask, which for a real user's click on a reset button runs _before_ the browser restores control values. An uncontrolled `defaultChecked` Checkbox was left rendering unchecked while still submitting its value; a controlled one was left contradicting its parent. Also fixes a `Checkbox` whose `<form>` mounts after it does, which previously never resynced at all ([#118](https://github.com/Tampere/Tampere-design-system/issues/118)).
- `Checkbox` no longer triggers React's "Too many re-renders" limit when used uncontrolled, with no `checked` prop ([#122](https://github.com/Tampere/Tampere-design-system/issues/122)).
- **`Checkbox` now honours a `preventDefault()` veto issued on the native click event**, not only on React's synthetic one. React's synthetic `defaultPrevented` is a copy taken before any handler runs, so a caller vetoing via `e.nativeEvent.preventDefault()` previously had the toggle applied anyway — leaving React state and the DOM permanently split, with the icon checked, the input unchecked, and the field missing from a form submit ([#118](https://github.com/Tampere/Tampere-design-system/issues/118)).
- **A controlled `Checkbox` whose `checked` prop is cleared to `null` now stays controlled and renders unchecked.** `null` reached the native input as `checked={null}`, which React reads as no `checked` prop at all: the input silently stopped being controlled, React stopped writing its value, and it logged a controlled-to-uncontrolled warning ([#118](https://github.com/Tampere/Tampere-design-system/issues/118)).
- `Checkbox`'s label now uses the same `typography.p2` body-text style as `RadioButton`'s, instead of inheriting the ambient font ([#123](https://github.com/Tampere/Tampere-design-system/issues/123)).
- `Checkbox` no longer logs React's "provided a `checked` prop to a form field without an `onChange` handler" warning for the controlled `onClick`-only usage the component itself documents. A caller's own `onChange` is still forwarded ([#124](https://github.com/Tampere/Tampere-design-system/issues/124)).

## [0.8.0] - 2026-08-18

### Upgrade notes

- **Breaking: `IconButton`'s `variant` prop renamed `light`/`dark` → `default`/`inverted`**, matching Figma's own naming and fixing the inverted-from-intuition naming (`variant="light"` rendered a _dark_-surface icon) ([#105](https://github.com/Tampere/Tampere-design-system/issues/105)).

  | Old               | New                  |
  | ----------------- | -------------------- |
  | `variant="light"` | `variant="inverted"` |
  | `variant="dark"`  | `variant="default"`  |

  `LabeledIconButton`'s `variant` prop uses the same `default`/`inverted` naming — no migration needed there, since it was still unreleased.

  Also corrects `IconButton`'s default value: it silently defaulted to the inverted/light-icon variant with no rationale in the code or history, and no internal consumer ever relied on it (every usage in this library passes `variant` explicitly). Both components now default to `variant="default"`. If you render either component without an explicit `variant` and relied on the old (undocumented) light-icon default, pass `variant="inverted"` explicitly.

- **Breaking: `Modal`'s `closeButtonProps` now requires an `'aria-label'`.** Previously optional with no fallback, so a consumer that omitted it shipped a close button with no accessible name — an axe-critical `button-name` violation ([#94](https://github.com/Tampere/Tampere-design-system/issues/94)). Pass `closeButtonProps={{ 'aria-label': '...' }}` explicitly.
- **Breaking: `Pagination`'s `leftButtonLabel`/`rightButtonLabel` are now required.** Same reasoning as `Modal` above — previously optional with no fallback, so omitting them shipped prev/next chevrons with no accessible name ([#95](https://github.com/Tampere/Tampere-design-system/issues/95)).

### Added

- `LabeledIconButton` component — an icon with a text label underneath, sharing `IconButton`'s state-color tokens ([#90](https://github.com/Tampere/Tampere-design-system/issues/90)).
- Two new component tokens on `vars`: `iconButton.minTouchTarget` (the 24px WCAG touch-target floor) and `labeledIconButton.spacing` (gap between icon and label) ([#90](https://github.com/Tampere/Tampere-design-system/issues/90)).

### Fixed

- `IconButton` now guarantees a 24x24px minimum touch target (WCAG 2.2 AA, SC 2.5.8) at every size ([#90](https://github.com/Tampere/Tampere-design-system/issues/90)).
- `IconButton`'s focus-visible state now shows the same background overlay as hover/active, matching the Figma design (previously outline-only) ([#90](https://github.com/Tampere/Tampere-design-system/issues/90)).
- Corrected a stale `iconButton` background-overlay token value (`#f1eeeb` → `#f7f7f9`) that didn't match Figma ([#90](https://github.com/Tampere/Tampere-design-system/issues/90)).
- `IconButton` and `LabeledIconButton` no longer paint the hover background overlay on a disabled button — a disabled `<button>` still matches CSS `:hover` (a widely-known cross-browser behavior, verified here in this project's Chromium test environment), so a hovered disabled button previously showed the hover state ([#90](https://github.com/Tampere/Tampere-design-system/issues/90)).
- `IconButton`/`LabeledIconButton`'s demo stories now pair each variant with a Figma-accurate background (plain for `default`, a dark strip for `inverted`) — the previous `Dark`/`Light` stories had the pairing backwards, which is what led to filing #105 in the first place ([#105](https://github.com/Tampere/Tampere-design-system/issues/105)).
- `IconButton`'s Storybook `Dark` story (now `Inverted`) actually renders the variant it's named after — an explicit prop placed before `{...args}` was previously clobbered by the meta's default args ([#91](https://github.com/Tampere/Tampere-design-system/issues/91)).
- `Modal`'s close button always has an accessible name now, regardless of what the consumer passes ([#94](https://github.com/Tampere/Tampere-design-system/issues/94)).
- `Pagination`'s prev/next chevron buttons always have an accessible name now, regardless of what the consumer passes ([#95](https://github.com/Tampere/Tampere-design-system/issues/95)).
- `LabeledIconButton` no longer lets a consumer's `aria-label`/`aria-labelledby` silently override the visible `label` as the accessible name — TypeScript exempts hyphenated JSX attributes from excess-property checks, so excluding them from the prop type alone didn't stop this at actual call sites; now also stripped at runtime ([#90](https://github.com/Tampere/Tampere-design-system/issues/90)).
- `LabeledIconButton` now accepts standard button attributes (`id`, `title`, `onFocus`, `onMouseEnter`, etc.) that were previously typed away entirely ([#90](https://github.com/Tampere/Tampere-design-system/issues/90)).

## [0.7.0] - 2026-08-14

### Upgrade notes

- **Breaking: token API restructured into four tiers.** Closes [#65](https://github.com/Tampere/Tampere-design-system/issues/65). `vars`/`themeVariables` (and the package's other theme exports) now expose `primitives` (raw color/spacing palette), `brand` (brand-mode color stops, e.g. `brand.blue.main`), `theme` (semantic + component tokens — everything that was under `core`/`text`/`components`/`font`/`highlight`/ `focusRing`, except `core`'s `main*` brand stops, which moved to `brand` instead), and `breakpoint` (the responsive per-breakpoint value tables, renamed singular from `breakpoints`). If you styled against raw tokens (uncommon — most consumers only use component props), update paths per the table below. This is a pure rename for anyone consuming tokens via `vars` (the Vanilla Extract CSS variables) — no visual output changes. Consumers who imported the raw `breakpoints`/`getComponents` JS exports directly will also see corrected values, not just renamed paths — see **Fixed** below.

  | Old                               | New                                           |
  | --------------------------------- | --------------------------------------------- |
  | `core.background`                 | `theme.background.default`                    |
  | `core.backgroundDisabled`         | `theme.background.disabled`                   |
  | `core.contrast`                   | `theme.contrast`                              |
  | `core.error`                      | `theme.error`                                 |
  | `core.main*`                      | `brand.blue.*`                                |
  | `core.focus.*`                    | `theme.focus.*`                               |
  | `core.hover.*`                    | `theme.hover.*`                               |
  | `core.divider`                    | `theme.divider`                               |
  | `core.cornerRadius`               | `theme.cornerRadius`                          |
  | `core.strokeWeight`               | `theme.strokeWeight`                          |
  | `core.dropshadow`                 | `theme.dropShadow`                            |
  | `core.states.*`                   | `theme.states.*`                              |
  | `core.inputStates.*`              | `theme.inputStates.*`                         |
  | `core.selectionStates.*`          | `theme.selectionStates.*`                     |
  | `text.*`                          | `theme.text.*`                                |
  | `font.letterSpacing`              | `theme.font.letterSpacing`                    |
  | `highlight.*`                     | `theme.highlight.*`                           |
  | `focusRing` / `focusRingInverted` | `theme.focusRing` / `theme.focusRingInverted` |
  | `components.*`                    | `theme.components.*`                          |
  | `colors.*`                        | `primitives.colors.*`                         |
  | `spacing[...]`                    | `primitives.spacing[...]`                     |
  | `breakpoints[...]`                | `breakpoint[...]`                             |

- **Breaking: `breakpointsV2`/`getComponentsV2`/`themeVariablesV2`/`ThemeVariablesV2` removed.** The deprecated pre-Figma-realignment `themeVariables_OLD.ts` and its `V2`-suffixed aliases are gone. Use the unsuffixed `breakpoint`/`themeVariables`/`ThemeVariables` exports.
- **Breaking: unsuffixed `breakpoints` export removed, renamed to `breakpoint`.** Update imports of `breakpoints` from `@tampere/treds` to the singular `breakpoint`.
- **Breaking: unsuffixed `getComponents` export removed, replaced by `getTheme`.** `getComponents(bp)` returned per-breakpoint component tokens directly (e.g. `getComponents(bp).button`). `getTheme(bp)` is **not** a drop-in replacement with the same shape — it returns the full `theme` tier for that breakpoint, with the same component tokens now nested one level deeper, under `.components` (e.g. `getTheme(bp).components.button`). Update call sites to add the `.components` segment.

### Added

- `getTheme(bp)`, returning the full `theme` tier of tokens for a given breakpoint. Throws a clear error if `bp` is not a valid breakpoint key.
- `Theme` type, describing the shape returned by `getTheme(bp)`.
- `Primitives`, `Brand`, `Breakpoint`, `BreakpointKey`, and `BreakpointValues` types, describing the `primitives`, `brand`, and `breakpoint` token tiers.

### Fixed

- The package's raw `themeVariables`/`ThemeVariables`, `breakpoints` (now `breakpoint`), and `getComponents` (now `getTheme`) JS exports (unsuffixed) now return the corrected, current token values instead of the stale pre-#85 values (opaque grey dropshadow, 5% hover overlay, non-variable fonts, missing `inputStates`, a missing `xxl` breakpoint tier, and wrong `xl` logo/search-width values). Previously `src/theme/index.ts` re-exported all of these from the deprecated `themeVariables_OLD.ts`, so consumers importing any raw JS export (rather than the Vanilla Extract `vars` CSS variables) still saw pre-fix values even after 0.6.0 corrected the rendered output. Closes [#92](https://github.com/Tampere/Tampere-design-system/issues/92).

### Internal / tooling

- Fixed `.husky/pre-push`'s main-branch guard, which used bash `[[ ]]` syntax under `/bin/sh` and silently failed to block anything (#98).

## [0.6.0] - 2026-08-12

**Storybook:** https://tampere.github.io/Tampere-design-system/

### Upgrade notes

- **Visual: Accordion item shadow changed.** The drop shadow under each `Accordion` item is now Figma's semi-transparent black (was an opaque grey). Worth a quick visual check if you have snapshot tests.
- **Visual: DateField calendar popover shadow changed.** Same opaque-grey-to-semi-transparent-black correction as `Accordion`, applied to the calendar popover's drop shadow.
- **Visual: IconButton `size="sm"` icons are slightly larger.** The rendered icon grows from 16px to 18px to match Figma.
- **Visual: IconButton `size="lg"` is now square.** Because the button's root has no explicit width/height (it sizes to its content), correcting the icon from 24×28 to 24×24 also shrinks the rendered button box to match. This affects `Pagination`'s chevron buttons and `Modal`'s close button — worth a quick visual check.
- **Visual: IconButton contrast-disabled icons are slightly darker.** The disabled icon color moves one shade darker (neutral/300 → neutral/400) to match Figma.
- **Visual: SearchField's search trigger icon now shrinks at narrow breakpoints** instead of staying a fixed size, matching the control's responsive sizing.
- **Breaking: `TableRow` selection is now a controlled prop.** See the **Breaking:** entries under `### Changed` below for the migration.
- **Breaking: the `red` color palette's internal structure changed** for consumers of the raw `colors`/`themeVariablesV2` palette. See the **Breaking:** entries under `### Changed` below — semantic token consumers are unaffected.

### Added

- `IconButton` now supports `size="xs"`, matching the extra-small variant already available on other controls.
- `TableRow` now sets `aria-selected` to reflect its `selected` state, for assistive technology (#48).

### Fixed

- Token values corrected to match Figma: dropshadow (was a solid grey, now Figma's semi-transparent black), icon xs/sm sizes (12/16px → 16/18px), IconButton contrast-disabled color (neutral/300 → neutral/400), hover overlay contrast opacity (5% → 10%). The red color palette's internal structure was also cleaned up to match Figma's 3-step scale — no visible color change, since the correct value was already reachable under a differently-named key (see the **Breaking:** entry under `### Changed` below for raw-palette consumers) (#85). Note: these corrections apply to the library's live CSS/rendered output; the package's raw `themeVariables` JS export still returns the pre-fix values pending [#92](https://github.com/Tampere/Tampere-design-system/issues/92).
- `SearchField`'s search trigger icon now scales with the responsive control size instead of staying a fixed 24px (#82).
- Pagination's "next page" chevron now renders the actual right-pointing icon instead of a rotated left-pointing one (no visible change) (#45).
- IconButton's `size="lg"` icon is now square (24×24, was 24×28) to match Figma; since the button's root is content-sized, this also shrinks the rendered button box, affecting `Pagination`'s chevron buttons and `Modal`'s close button (#93, #45).

### Changed

- **Breaking:** `TableRow` selection is now a controlled prop (`selected`/`onSelectedChange`) instead of an internal DOM `classList` mutation. Consumers relying on the previous click-to-toggle-automatically behavior must now manage selection state themselves (#48).

  ```diff
  - <TableRow onClick={handleClick}>
  + <TableRow selected={isSelected} onSelectedChange={setIsSelected}>
      <TableCell>...</TableCell>
    </TableRow>
  ```

- **Breaking: the `red` color palette's internal structure changed.** `colors.red` (exposed via `vars.colors` and the raw `themeVariablesV2` export) now has 3 steps instead of 4, matching Figma. `red['400']` was removed, and the value it held (`#ae1e20`) now lives under `red['300']` instead of the old, non-Figma `red['300']` (`#da2321`). This only affects consumers who referenced the raw `colors` palette directly instead of the semantic `core.error`/`core.states.error` tokens, which resolve to the same corrected color as before (#85).

## [0.5.0] - 2026-08-06

**Storybook:** https://tampere.github.io/Tampere-design-system/

### Upgrade notes

- **New required peer dependencies.** Update your install: `npm install @tampere/treds@0.5.0 @mantine/dates dayjs`
- **Visual: form-control borders and label weight changed.** `TextField`, `TextArea`, and `Select` now render a neutral gray resting border (was incorrectly blue) with a blue border only on focus/hover, and field labels are now Semi-Bold (matching Figma; previously an unstyled default weight). Worth a quick visual check if you have snapshot tests or tightly styled forms.

### Added

- **`DateField`** — date input built on `TextField` + a portalled Mantine `Calendar`, Finnish-localized. Controlled/uncontrolled, `min`/`max`, clear button, single-digit Finnish entry (`1.8.2025`), full keyboard navigation including crossing month boundaries with the arrow keys, WCAG 2.1 AA. Customizable labels incl. `yearLabel`/`monthLabel`; distinct invalid vs. out-of-range errors. Exports `DateField`, `DateFieldProps`, `DateFieldClassNames` (#52, #83).
- `Button` now forwards refs to its underlying element.
- `TextField` `helperText` now accepts `React.ReactNode` (was `string`).

### Fixed

- `TextField`/`TextArea`/`Select` resting border color corrected to the neutral gray Figma specifies (was reusing the brand-blue interactive color at rest); focus border now explicitly renders blue at 3px instead of relying on that same bug for its color.
- Error color (border and text) corrected to Figma's darker red — was a shade too bright.

## [0.4.0] - 2026-08-03

**Storybook:** https://tampere.github.io/Tampere-design-system/

Bundles everything merged since `v0.3.1`.

### Upgrade notes

- **Breaking — font packages changed.** Update your install: `npm install @tampere/treds@0.4.0 @fontsource-variable/montserrat @fontsource-variable/open-sans` then `npm uninstall @fontsource/montserrat @fontsource/open-sans`.
- **Control heights changed.** Buttons, text inputs, and selects now share one responsive height token with `box-sizing: border-box`. Tight or custom-aligned layouts may shift by a few pixels at some breakpoints — worth a quick visual check on dense forms.

### Changed

- **BREAKING:** Migrated typography to variable fonts. The peer dependencies `@fontsource/montserrat` and `@fontsource/open-sans` are replaced by `@fontsource-variable/montserrat` and `@fontsource-variable/open-sans` (#86). Font families are now `"Montserrat Variable"` (headings) and `"Open Sans Variable"` (body); `ThemeProvider` imports the variable font CSS from the `@fontsource-variable/*` packages, which stay external in the published bundle and are resolved by the consumer's build. Replaces the nine discrete `@fontsource/*` per-weight CSS imports with one variable-axis import per family.
- Consistent responsive control height across buttons/inputs/selects via a new `controlHeight` token with `border-box` sizing (#79, #80).
- Internal: `LoadingIndicators` folder renamed to `LoadingSpinner` — the public `LoadingSpinner` export is unchanged, so no consumer action is required.

### Fixed

- Select chevron rotation and toggle behavior (#78).
- Missing font family in the theme (#68).
- Restored missing `RadioButton` export and corrected the `Modal` index export (#64).
- Added the missing `ArrowDownIcon` export (#77).

### Internal / tooling

- Conventional Commits config and git push hooks (#67).
- `.npmrc` template (#66).
- Issue templates.
