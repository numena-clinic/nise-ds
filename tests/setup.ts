// Runs before every test file (see vitest.config.ts).
import "@testing-library/jest-dom/vitest";

// jsdom omits a few browser APIs that Radix's primitives (Select, Slider,
// Tooltip, Dialog) call on pointer interaction. Provide the minimum so
// keyboard/pointer tests run.
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

if (!("PointerEvent" in globalThis)) {
  // @ts-expect-error minimal stand-in, enough for Radix's event wiring
  globalThis.PointerEvent = MouseEvent;
}

// jsdom exposes the key but not a usable implementation; some components read
// it for prefers-reduced-motion. Replace whatever is there with a minimal
// stand-in.
if (typeof globalThis.matchMedia !== "function") {
  Object.defineProperty(globalThis, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

for (const proto of [Element.prototype, HTMLElement.prototype]) {
  if (!proto.scrollIntoView) {
    proto.scrollIntoView = () => {};
  }
  if (!proto.hasPointerCapture) {
    proto.hasPointerCapture = () => false;
  }
  if (!proto.setPointerCapture) {
    proto.setPointerCapture = () => {};
  }
  if (!proto.releasePointerCapture) {
    proto.releasePointerCapture = () => {};
  }
}
