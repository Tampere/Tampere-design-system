# Project Guidance

This file provides context and guidance for working with this project. It is shared with the team via git — personal preferences belong in `CLAUDE.local.md` (git-ignored).

## Project Overview

TREDS (Tampere Design System) is a React component library for the City of Tampere, built on top of [Mantine](https://mantine.dev/) v8 (peer dependency). It's published to GitHub Packages as `@tampere/treds`. Licensed under the EUPL.

**Tech stack**: React 19, TypeScript, Mantine v8, Storybook 10 (with the a11y addon — accessibility is a first-class concern), Rollup for the library build, Vitest (+ Playwright/Chromium, browser mode) for tests, ESLint + Prettier for linting/formatting, Husky + lint-staged + commitlint for git hooks.

## Language

Project content (code, comments, docs, data, UI text) may contain Finnish terms. If any Finnish term, text, or context is unclear, ask for an explanation in English rather than guessing at its meaning.

## Tools and Commands

- This project uses npm — do not offer or use yarn commands.
- `npm install && npm run prepare` — install dependencies and set up husky git hooks
- `npm run storybook` — local dev environment / component playground on port 6006 (there is no `npm start` — this repo is a library, not an app with a dev server)
- `npm run build` — build the library with Rollup (CJS + ESM + types)
- `npm run build-storybook` — build a static Storybook site
- `npm test` — run tests once; `npm run test:watch` — watch mode
- `npm run eslint` — lint (auto-fixes)
- `npm run prettier` — format; `npm run prettier:check` — check formatting without writing
- `npm run typecheck` — type-check both the root project and `.storybook` (which has its own tsconfig). The pre-commit hook runs this whenever a `.ts`/`.tsx` file is staged, so local and CI type-checking cover the same files.
- Check `package.json` for the full script list and `tsconfig.json` for TS config

## Architecture

### Source structure

```
src/
  index.ts              # Main entry: re-exports from components, theme, icons
  components/           # React components, one folder per component
  icons/                # SVG icon React components
  logos/                # Tampere logo/vaakuna React components
  theme/                # Design tokens and global CSS
  utils.ts
```

### Component pattern

Each component lives in its own folder with four files:

- `ComponentName.tsx` — React component, extends Mantine primitives
- `ComponentName.css.ts` — Vanilla Extract styles (type-safe CSS-in-TS)
- `ComponentName.stories.tsx` — Storybook stories; also act as browser tests
- `index.ts` — re-export

Stories are curated so the sidebar and the autodocs page stay readable: `tags: ['!dev', '!autodocs']` at the meta level hides every story from both (the vitest addon still runs them), and a handful of documentation stories opt back in with `tags: docExample`, where `const docExample = ['dev', 'autodocs']`. Follow this for new components — see `DateField`, `TimeField`, `Card`.

### Theming

Styling uses Vanilla Extract (`.css.ts` files), not Mantine's `sx` prop or CSS modules.

- `src/theme/tokens/{primitives,brand,theme,breakpoint}.ts` — the four Figma-aligned token tiers: primitives (raw color/spacing palette), brand (brand-mode color stops, e.g. `brand.blue.main`), theme (semantic + component tokens, returned per-breakpoint by `getTheme(bp)`), breakpoint (per-breakpoint value tables).
- `src/theme/themeVariables.ts` composes all four into one object.
- `src/theme/theme.css.ts` creates a Vanilla Extract theme contract from the composed `themeVariables` object and applies responsive overrides via `@media` queries, rebinding the theme tier per breakpoint through `getTheme(bp)`. Do not override Mantine theme tokens here — only define new tokens.
- Import tokens in `.css.ts` files via: `import { vars } from '../../theme'`

Typography and spacing scale responsively across six breakpoints: `xs, sm, md, lg, xl, xxl`. The CSS variables update automatically via media queries — no JS breakpoint logic needed in components.

**Using tokens in components**: `vars` is a contract mirroring the entire `themeVariables` object, so any nested path is usable as a CSS variable reference — e.g. `vars.theme.states.default`, `vars.theme.text.secondary`, `vars.theme.components.typography.p2.fontSize`, `vars.theme.focusRing`.

Standard `.css.ts` idiom — destructure once, then reference tokens:

```ts
import { style } from '@vanilla-extract/css';
import { vars } from '../../theme';

const {
  theme: {
    text,
    font,
    strokeWeight,
    states,
    components: { input: inputVars, typography },
    focusRing,
  },
} = vars;

export const field = style({
  color: text.primary,
  fontSize: typography.p2.fontSize,
  border: `${strokeWeight} solid ${states.default}`,
  letterSpacing: font.letterSpacing,
  selectors: { '&:focus-visible': { ...focusRing } }, // spread focusRing for focus
});
```

Token map (most-used): `theme` (semantic + component tokens — `background.default`/`background.disabled`, `contrast`, `divider`, `strokeWeight`, `dropShadow`, `states.*`, `text.*`, `font.letterSpacing`, `focusRing`/`focusRingInverted`, `components.<name>` incl. the responsive type scale `typography.p1…caption` and `input.font`/`padding`/`spacing`) · `brand.blue.*` (brand-mode color stops) · `breakpoint` (per-breakpoint value tables, e.g. `breakpoint.md.spacing.lg`) · `primitives` (raw colors/spacing palette — prefer the semantic `theme`/`brand` tokens over these).

Never hardcode design values (colours, sizes, spacing, font weights). Use a token; if the value has no token, add it to the appropriate tier file under `src/theme/tokens/` (`primitives.ts` for raw palette, `brand.ts` for brand-mode stops, `theme.ts` for semantic/component tokens — it then appears on `vars` automatically) rather than inlining a literal. Font weights have no shared primitive tier, but reuse an existing `typography.<style>.fontWeight` when a component's weight genuinely matches that style (e.g. an h5-sized label) — when it doesn't (e.g. borrowing a heavier style's weight at a different size), give the component its own weight token instead, as `components.chip.label.fontWeight` and `components.button.fontWeight` do, so the two styles can't drift apart by editing one.

**Gotcha — overriding Mantine internals via `globalStyle`**: a descendant selector like `globalStyle(`${gridClass} table button`, …)` outranks a single `style()` class (specificity `(0,1,2)` vs `(0,1,0)`). Per-state overrides applied as classes (e.g. selected/disabled day cells) therefore need `!important` to win over the broader `globalStyle`.

### ThemeProvider

Consumers must wrap their app in `<ThemeProvider>` (wraps `MantineProvider`), which imports Mantine base styles, the Vanilla Extract theme, and the Montserrat/Open Sans font weights.

### Build

- Library: Rollup → CJS, ESM and bundled type declarations in `dist/`. `rollup.config.js` takes the CJS and ESM output paths from `package.json`'s `main` and `module`, so the filenames live there (alongside `types` and `exports`) rather than being restated here.
- Dev/Storybook: Vite with `@vanilla-extract/vite-plugin` and `@vitejs/plugin-react`
- Peer dependencies (React, Mantine, fonts) are excluded from the bundle

## Coding Style

- Follow the existing style and conventions already present in the project (formatting, naming, file structure, patterns) over any generic default. Where the project doesn't already establish a convention, follow general best practices for the language in use.
- Follow TypeScript + React best practices; use strong typing (avoid `any` when possible).
- Keep accessibility in mind — the project uses Storybook's a11y addon.
- Use ESLint (`npm run eslint`) and Prettier (`npm run prettier`) — this repo's config is the source of truth over generic defaults.
- Simplest thing that works. No new runtime dependencies — `clsx` is the only one; build on the Mantine primitives already in `peerDependencies` rather than adding a package. Keep helpers inside the component's own folder until a second component needs them, then hoist to `src/utils.ts` (how `mergeClassNames` got there); a component that grows a second concern gets a second file in its own folder first — see `DateField`/`DateFieldCalendar.tsx`.
- Comments carry the non-obvious why, and nothing else. A comment that restates the code gets deleted, not shortened. What survives is what a reader can't derive: a browser quirk, an ordering constraint, the bug it prevents (cite the issue). Those earn their length — `Checkbox.tsx` spends nine lines on why the indeterminate effect has no dependency array. Everything else is one line: give the reason and stop, no illustrative examples.

## Accessible Names and UI Text

- Every interactive element and landmark must have an accessible name and the correct role. Enforce this in the props type, so a component can't render without one — see `Button`'s `iconOnly`/`aria-label` pairing.
- Built-in user-facing text (button labels, `aria-label`s, error messages) gets a Finnish default that consumers can override via a prop, since end users are generally Finnish speakers.
- When no sensible generic default exists (e.g. a form field's label, an icon-only button's purpose, a `nav` landmark that has to be told apart from others), make the prop required instead of optional.

## Testing Approach

- Tests run in a real browser via Playwright/Chromium — they execute Storybook stories using `@storybook/addon-vitest`, so the story files are the test files.
- Filter to one component with `npx vitest run src/components/<ComponentName>` — much faster than the full suite. Run the full `npm test` before committing anyway: some failures only appear under full-suite load.
- Check `package.json` and existing `*.stories.tsx` files for conventions before adding new tests.

## Branches and Pull Requests

- Issue numbers come from the GitHub Project backlog.
- Work on a feature branch named `type/issuenumber-name-in-kebab-case`, using the commit types below, e.g. `feat/42-tooltip-component`.
- Release branches are the exception: `chore/release-vX.Y.Z`, since a release has no backlog issue — see [Publishing a Release](#publishing-a-release).
- Push the branch and open a PR to request review.
- CI (`.github/workflows/ci.yml`) gates merging to `main`. It runs, in order: `npm run typecheck`, `npx eslint --max-warnings 0 src .storybook vite.config.ts vitest.shims.d.ts` (no `--fix`, so warnings fail the build too), `npm run prettier:check`, `npm test`, `npm run build`. Run the same set locally before opening a PR.

## Commit Message Convention

- This repo enforces [Conventional Commits](https://www.conventionalcommits.org/) via commitlint + husky — invalid commit messages are rejected automatically.
- Format: `type(#issue): subject`, where the scope is the issue number from the GitHub Project backlog, e.g. `feat(#42): add tooltip component`.
- Breaking changes: `fix(#67)!: breaking change`, plus a `BREAKING CHANGE:` footer.
- Release commits are the one exception to the issue-number scope: use the literal scope `release` — `chore(release): vX.Y.Z` — following the `standard-version` convention. No commitlint change is needed; `chore` is already a valid type and the `scope-case` rule accepts lower-case scopes. Give the release PR the same title, since a squash merge turns the PR title into the commit message on `main` (that path skips the `commit-msg` hook, so commitlint never checks it).
- Valid types: feat, fix, style, docs, refactor, test, chore, perf, build, ci, revert.
- If AI was used for the change, end the commit message with a `Co-Authored-By: Claude <noreply@anthropic.com>` trailer.

## Publishing a Release

A release goes through a PR like any other change: `.husky/pre-push` rejects pushes from `main`, and CI only runs on PRs to `main`, so bumping and pushing on `main` directly is rejected.

1. Branch off `main`: `chore/release-vX.Y.Z`.
2. Bump the version with `npm version patch|minor|major --no-git-tag-version` (edits `package.json` and `package-lock.json` only), add the `CHANGELOG.md` entry, and commit both as `chore(release): vX.Y.Z`. The flag matters: left to itself, `npm version` commits the message `vX.Y.Z`, which has no Conventional Commits type and is rejected by commitlint.
3. Push the branch, open the PR, let CI gate it, and merge to `main`.
4. Create a GitHub Release with a new tag `vX.Y.Z` targeting `main`. Creating the tag here rather than on the release branch keeps it on `main`'s history whatever the merge strategy — a tag made on the branch is orphaned by a squash merge (`v1.0.0` points at a branch commit and survives only because #174 was merged with a merge commit).
5. `.github/workflows/npm-publish.yml` picks up the published release, re-runs the full CI suite, and publishes to GitHub Packages on success.

## Additional Notes

- Always read relevant files before making changes.
- Run tests after making modifications.
- Follow the existing code structure and patterns.
- Ask for clarification if project requirements are unclear.
