import {expect} from "vitest";

expect.extend({
  toBeLatent(element) {
    const isLatent = element.matches(":state(latent)") && getComputedStyle(element).clipPath === "inset(100%)";
    return {
      pass: isLatent,
      message: () => `Component is ${this.isNot ? "not " : ""} expected to be in the latent state`,
    };
  },

  toBeXScrolledTo(element, position) {
    const actualPosition = element.scrollLeft;
    return {
      pass: actualPosition === position,
      message: () => "The element’s scroll position doesn’t match the expected value",
      actual: actualPosition,
      expected: position,
    };
  },
});
