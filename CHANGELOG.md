# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(pre-1.0: breaking changes bump the minor version).

## [Unreleased]

### Fixed

- Token values corrected to match Figma: dropshadow (was a solid grey, now
  Figma's semi-transparent black), icon xs/sm sizes (12/16px → 16/18px),
  IconButton contrast-disabled color (neutral/300 → neutral/400), hover
  overlay contrast opacity (5% → 10%). The red color palette's internal
  structure was also cleaned up to match Figma's 3-step scale — no visible
  color change, since the correct value was already reachable under a
  differently-named key (#85).
- `SearchField`'s search trigger icon now scales with the responsive control
  size instead of staying a fixed 24px (#82).
- Pagination's "next page" chevron now renders the actual right-pointing
  icon instead of a rotated left-pointing one (no visible change) (#45).

### Changed

- **Breaking:** `TableRow` selection is now a controlled prop
  (`selected`/`onSelectedChange`) instead of an internal DOM `classList`
  mutation. Consumers relying on the previous click-to-toggle-automatically
  behavior must now manage selection state themselves (#48).

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
