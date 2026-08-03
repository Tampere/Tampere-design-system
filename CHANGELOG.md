# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(pre-1.0: breaking changes bump the minor version).

## [0.4.0] - 2026-08-03

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
