// Runs before every test file (see vitest.config.ts).
import "@testing-library/jest-dom/vitest";

// React Aria's selection indicator queries browser animations. jsdom has no
// animation engine; motion behavior is verified in the real browser suite.
if (!Element.prototype.getAnimations)
  Element.prototype.getAnimations = () => [];

// jsdom omits a few browser APIs that the headless primitives (Select, Slider,
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
  class TestPointerEvent extends MouseEvent {
    readonly pointerId: number;
    readonly pointerType: string;
    readonly isPrimary: boolean;
    constructor(type: string, init: PointerEventInit = {}) {
      super(type, init);
      this.pointerId = init.pointerId ?? 1;
      this.pointerType = init.pointerType ?? "mouse";
      this.isPrimary = init.isPrimary ?? true;
    }
  }
  // jsdom omits the rest of the pointer geometry; interactions use these fields.
  globalThis.PointerEvent = TestPointerEvent as typeof PointerEvent;
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
