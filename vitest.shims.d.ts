/// <reference types="@vitest/browser-playwright" />

export {};

declare module 'vitest/browser' {
  interface BrowserCommands {
    parkMouse: () => Promise<void>;
  }
}
