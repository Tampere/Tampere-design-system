# Tampere Design System (TREDS)

Design system for the City of Tampere.

Tampere Design System (TREDS) is developed by the City of Tampere to enable creating accessible, high-quality digital services with a consistent user experience.

This React component library is built on top of [Mantine](https://mantine.dev/).

---

## 📄 License

TREDS is released under the **European Union Public Licence (EUPL)**.  
See the `LICENSE` file for full license details.

---

## 🚧 Development

### **Installation**

```bash
npm install
npm run prepare
```

### Storybook

```bash
npm run storybook
```

### Eslint and Prettier

```bash
npm run eslint
npm run prettier
```

### Build with rollup

```bash
npm run build
```

## Using TREDS in a Project

### Setup with NPM-package

To install this package from GitHub Packages, you need to configure npm to use the GitHub registry and authenticate with a Personal Access Token.

#### 1. Configure project .npmrc

Create a `.npmrc` file in your project root:

```
@tampere:registry=https://npm.pkg.github.com
```

#### 2. Add authentication (user-level)

Add your GitHub Personal Access Token to your user-level npm config:

`~/.npmrc`

```
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PAT
```

#### 3. Install the package

```bash
npm install @tampere/treds
```

Peer dependencies (`@mantine/core`, `@fontsource/montserrat`, `@fontsource/open-sans`) are installed automatically with npm v7+. To install specific versions, add them explicitly to the command above.

### Setup without NPM-package (Not recommended)

Clone this repository next to your project folder:

```
my-projects/
├── tampere-design-system/
└── your-project/
```

Build Tampere Design System as instructed above, then install it inside your project:

```bash
npm install ../Tampere-design-system
```

Peer dependencies (`@mantine/core`, `@fontsource/montserrat`, `@fontsource/open-sans`) are installed automatically with npm v7+. To install specific versions, add them explicitly to the command above.

### Usage

`main.tsx`

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import { ThemeProvider } from '@tampere/treds';

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

`app.tsx`

```jsx
import { Button } from '@tampere/treds';

const App = () => {
  return <Button>Click here!</Button>;
};

export default App;
```

## 📦 How to Publish a New Release of TREDS

Below are the steps for creating and publishing a new release of the Tampere Design System (TREDS).  
These instructions assume you have the required permissions for the repository.

### 1. Update Version Number

TREDS uses semantic versioning (SemVer):

- **MAJOR** → breaking changes
- **MINOR** → new features, no breaking changes
- **PATCH** → small fixes

Update the version in `package.json`:

```bash
npm version patch
# or: npm version minor
# or: npm version major
```

This command will:

- Update package.json and package-lock.json
- Create a Git commit
- Create a Git tag

### 2. Push the commit and the tag

```bash
git push
git push origin --tags

```

### 3. Merge changes

Merge your changes into the `main` branch

### 4. Create a GitHub Release

1. Go to GitHub → Releases
2. Click Draft a new release
3. Select the newly created tag (vX.X.X)
4. Add release notes
   - Summary of changes
   - New components
   - Breaking changes (if any)
5. Publish the release

Now GitHub action job will publish the new version of the NPM package.

## 🔀 Commit Message Guidelines

This project follows [Conventional Commits](https://www.conventionalcommits.org/).

### Types

- **feat**: New feature
- **fix**: Bug fix
- **style**: Code style updates with no functional changes
- **docs**: Documentation changes
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Code performance improvements
- **build**: Commits that affect build-related components
- **ci**: Commits that affect CI/CD configurations or workflows
- **revert**: Commits that reverts changes

If applicable, issue ticket number should be added as scope value.

Breaking changes must be marked with `!` before `:` in the subject line.
Also `BREAKING CHANGE:` should be described in the commit footer section, if the commit description isn't sufficiently informative.

Commits are automatically validated. Invalid formats will be rejected.

See `.commitlintrc` for full details.

### Examples

```
feat(#42): Add user authentication
```

```
fix(#67)!: Breaking change
```
