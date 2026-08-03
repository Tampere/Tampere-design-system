# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html)
(pre-1.0: breaking changes bump the minor version).

## [0.4.0]

### Changed

- **BREAKING:** Migrated typography to variable fonts. The peer dependencies
  `@fontsource/montserrat` and `@fontsource/open-sans` are replaced by
  `@fontsource-variable/montserrat` and `@fontsource-variable/open-sans`.
  Consumers must update their installed font packages accordingly.
- Font families are now `"Montserrat Variable"` (headings) and
  `"Open Sans Variable"` (body). `@font-face` declarations ship via
  `src/styles/fonts/` and are loaded by `ThemeProvider`.

### Removed

- The nine discrete `@fontsource/*` per-weight CSS imports in `ThemeProvider`,
  replaced by a single variable-axis file per family.
