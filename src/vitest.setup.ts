import '@testing-library/jest-dom';

// Node 22+ defines an experimental global `localStorage`/`sessionStorage` that shadows
// the real jsdom Storage implementation vitest would otherwise expose (see
// vitest's populateGlobal: it skips copying window keys that already exist on
// `global`). Route the globals back to the actual jsdom-backed Storage so
// localStorage works as expected in tests.
const jsdomWindow = (globalThis as unknown as { jsdom?: { window: Window } }).jsdom?.window;
if (jsdomWindow) {
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    get: () => jsdomWindow.localStorage,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    get: () => jsdomWindow.sessionStorage,
  });
}
