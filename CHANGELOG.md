# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(pre-1.0: breaking changes bump the minor version).

## [Unreleased]

### Upgrade notes

- **Visual: Accordion item shadow changed.** The drop shadow under each
  `Accordion` item is now Figma's semi-transparent black (was an opaque
  grey). Worth a quick visual check if you have snapshot tests.
- **Visual: DateField calendar popover shadow changed.** Same
  opaque-grey-to-semi-transparent-black correction as `Accordion`, applied to
  the calendar popover's drop shadow.
- **Visual: IconButton `size="sm"` icons are slightly larger.** The rendered
  icon grows from 16px to 18px to match Figma.
- **Visual: IconButton `size="lg"` is now square.** Because the button's root
  has no explicit width/height (it sizes to its content), correcting the icon
  from 24×28 to 24×24 also shrinks the rendered button box to match. This
  affects `Pagination`'s chevron buttons and `Modal`'s close button — worth a
  quick visual check.
- **Visual: IconButton contrast-disabled icons are slightly darker.** The
  disabled icon color moves one shade darker (neutral/300 → neutral/400) to
  match Figma.
- **Visual: SearchField's search trigger icon now shrinks at narrow
  breakpoints** instead of staying a fixed size, matching the control's
  responsive sizing.
- **Breaking: `TableRow` selection is now a controlled prop.** See the
  **Breaking:** entries under `### Changed` below for the migration.
- **Breaking: the `red` color palette's internal structure changed** for
  consumers of the raw `colors`/`themeVariablesV2` palette. See the
  **Breaking:** entries under `### Changed` below — semantic token consumers
  are unaffected.

### Added

- `IconButton` now supports `size="xs"`, matching the extra-small variant
  already available on other controls.
- `TableRow` now sets `aria-selected` to reflect its `selected` state, for
  assistive technology (#48).

### Fixed

- Token values corrected to match Figma: dropshadow (was a solid grey, now
  Figma's semi-transparent black), icon xs/sm sizes (12/16px → 16/18px),
  IconButton contrast-disabled color (neutral/300 → neutral/400), hover
  overlay contrast opacity (5% → 10%). The red color palette's internal
  structure was also cleaned up to match Figma's 3-step scale — no visible
  color change, since the correct value was already reachable under a
  differently-named key (see the **Breaking:** entry under `### Changed`
  below for raw-palette consumers) (#85). Note: these corrections apply to the
  library's live CSS/rendered output; the package's raw `themeVariables` JS
  export still returns the pre-fix values pending
  [#92](https://github.com/Tampere/Tampere-design-system/issues/92).
- `SearchField`'s search trigger icon now scales with the responsive control
  size instead of staying a fixed 24px (#82).
- Pagination's "next page" chevron now renders the actual right-pointing
  icon instead of a rotated left-pointing one (no visible change) (#45).
- IconButton's `size="lg"` icon is now square (24×24, was 24×28) to match
  Figma; since the button's root is content-sized, this also shrinks the
  rendered button box, affecting `Pagination`'s chevron buttons and `Modal`'s
  close button (#93, #45).

### Changed

- **Breaking:** `TableRow` selection is now a controlled prop
  (`selected`/`onSelectedChange`) instead of an internal DOM `classList`
  mutation. Consumers relying on the previous click-to-toggle-automatically
  behavior must now manage selection state themselves (#48).

  ```diff
  - <TableRow onClick={handleClick}>
  + <TableRow selected={isSelected} onSelectedChange={setIsSelected}>
      <TableCell>...</TableCell>
    </TableRow>
  ```

- **Breaking: the `red` color palette's internal structure changed.**
  `colors.red` (exposed via `vars.colors` and the raw `themeVariablesV2`
  export) now has 3 steps instead of 4, matching Figma. `red['400']` was
  removed, and the value it held (`#ae1e20`) now lives under `red['300']`
  instead of the old, non-Figma `red['300']` (`#da2321`). This only affects
  consumers who referenced the raw `colors` palette directly instead of the
  semantic `core.error`/`core.states.error` tokens, which resolve to the
  same corrected color as before (#85).

## [0.5.0] - 2026-08-06

**Storybook:** https://tampere.github.io/Tampere-design-system/

### Upgrade notes

- **New required peer dependencies.** Update your install:
  `npm install @tampere/treds@0.5.0 @mantine/dates dayjs`
- **Visual: form-control borders and label weight changed.** `TextField`,
  `TextArea`, and `Select` now render a neutral gray resting border (was
  incorrectly blue) with a blue border only on focus/hover, and field labels
  are now Semi-Bold (matching Figma; previously an unstyled default weight).
  Worth a quick visual check if you have snapshot tests or tightly styled
  forms.

### Added

- **`DateField`** — date input built on `TextField` + a portalled Mantine
  `Calendar`, Finnish-localized. Controlled/uncontrolled, `min`/`max`, clear
  button, single-digit Finnish entry (`1.8.2025`), full keyboard navigation
  including crossing month boundaries with the arrow keys, WCAG 2.1 AA.
  Customizable labels incl. `yearLabel`/`monthLabel`; distinct invalid vs.
  out-of-range errors. Exports `DateField`, `DateFieldProps`,
  `DateFieldClassNames` (#52, #83).
- `Button` now forwards refs to its underlying element.
- `TextField` `helperText` now accepts `React.ReactNode` (was `string`).

### Fixed

- `TextField`/`TextArea`/`Select` resting border color corrected to the
  neutral gray Figma specifies (was reusing the brand-blue interactive
  color at rest); focus border now explicitly renders blue at 3px instead of
  relying on that same bug for its color.
- Error color (border and text) corrected to Figma's darker red — was a
  shade too bright.

## [0.4.0] - 2026-08-03

**Storybook:** https://tampere.github.io/Tampere-design-system/

Bundles everything merged since `v0.3.1`.

### Upgrade notes

- **Breaking — font packages changed.** Update your install:
  `npm install @tampere/treds@0.4.0 @fontsource-variable/montserrat @fontsource-variable/open-sans`
  then `npm uninstall @fontsource/montserrat @fontsource/open-sans`.
- **Control heights changed.** Buttons, text inputs, and selects now share one
  responsive height token with `box-sizing: border-box`. Tight or custom-aligned
  layouts may shift by a few pixels at some breakpoints — worth a quick visual
  check on dense forms.

### Changed

- **BREAKING:** Migrated typography to variable fonts. The peer dependencies
  `@fontsource/montserrat` and `@fontsource/open-sans` are replaced by
  `@fontsource-variable/montserrat` and `@fontsource-variable/open-sans`
  (#86). Font families are now `"Montserrat Variable"` (headings) and
  `"Open Sans Variable"` (body); `ThemeProvider` imports the variable font CSS
  from the `@fontsource-variable/*` packages, which stay external in the
  published bundle and are resolved by the consumer's build. Replaces the nine
  discrete `@fontsource/*` per-weight CSS imports with one variable-axis import
  per family.
- Consistent responsive control height across buttons/inputs/selects via a new
  `controlHeight` token with `border-box` sizing (#79, #80).
- Internal: `LoadingIndicators` folder renamed to `LoadingSpinner` — the public
  `LoadingSpinner` export is unchanged, so no consumer action is required.

### Fixed

- Select chevron rotation and toggle behavior (#78).
- Missing font family in the theme (#68).
- Restored missing `RadioButton` export and corrected the `Modal` index export
  (#64).
- Added the missing `ArrowDownIcon` export (#77).

### Internal / tooling

- Conventional Commits config and git push hooks (#67).
- `.npmrc` template (#66).
- Issue templates.
