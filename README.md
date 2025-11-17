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
```

### Storybook

```bash
npm run storybook
```

### Eslint and Prettier

```bash
npm run eslint
```

```bash
npm run format
```

### Build with rollup

```bash
npm run build
```

## Using TREDS in a Project

### Setup (Before npm Package Is Published)

Until the npm package is available, clone this repository next to your project folder:

my-projects/
├── tampere-design-system/
└── your-project/

Build Tampere Design System as instructed above, then install it inside your project:

```bash
npm install ../Tampere-design-system
npm install --save-peer @mantine/core
```

**_Note!_** If you use Mantine in your project you can remove the `--save-peer` flag.

### Usage

main.tsx

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";

import { ThemeProvider } from "treds";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

app.tsx

```jsx
import { Button } from 'treds';

const App = () => {
  return <Button>Click here!</Button>;
};

export default App;
```
