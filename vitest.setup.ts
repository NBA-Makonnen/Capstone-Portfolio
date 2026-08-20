import "@testing-library/jest-dom/vitest";

// jsdom doesn't implement matchMedia. Default every query to "no match"
// (matches: false) so components using prefers-reduced-motion, etc. don't
// throw; individual tests can override window.matchMedia for a specific
// query when they need to simulate a match.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
