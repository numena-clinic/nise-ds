// Runs before every test file (see vitest.config.ts).
import "@testing-library/jest-dom/vitest";

// jsdom omits a few browser APIs that Radix's primitives (Select) call on
// pointer interaction. Provide the minimum so keyboard/pointer tests run.
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
