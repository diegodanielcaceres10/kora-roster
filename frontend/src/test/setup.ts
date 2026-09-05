import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// Vitest doesn't run with `globals: true`, so @testing-library/react can't
// auto-detect the test framework to register its cleanup automatically.
// Without this, DOM from one `render()` leaks into the next test in the
// same file.
afterEach(() => {
  cleanup();
});
