import { JSDOM } from "jsdom";

/**
 * Minimal browser for component tests: jsdom globals plus the few APIs Radix reads
 * that jsdom does not implement (pointer capture, scrollIntoView, ResizeObserver).
 */
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true });
const { window } = dom;

// Node ships its own Event/EventTarget/CustomEvent; jsdom's dispatchEvent rejects those,
// so anything event-shaped must come from jsdom too.
const isJsdomOwned = (key: string) =>
  ["window", "document", "navigator", "location", "history", "EventTarget", "DOMException"].includes(key) || key.endsWith("Event");

for (const key of Object.getOwnPropertyNames(window)) {
  if (key in globalThis && !isJsdomOwned(key)) {
    continue;
  }

  Object.defineProperty(globalThis, key, {
    configurable: true,
    get: () => (window as unknown as Record<string, unknown>)[key]
  });
}

Object.defineProperty(globalThis, "window", { configurable: true, value: window });
Object.defineProperty(globalThis, "IS_REACT_ACT_ENVIRONMENT", { configurable: true, writable: true, value: true });

const elementPrototype = window.HTMLElement.prototype as unknown as Record<string, unknown>;
elementPrototype.hasPointerCapture = () => false;
elementPrototype.setPointerCapture = () => undefined;
elementPrototype.releasePointerCapture = () => undefined;
elementPrototype.scrollIntoView = () => undefined;

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

Object.defineProperty(globalThis, "ResizeObserver", { configurable: true, value: ResizeObserverStub });
