import {defineConfig} from "vitest/config";
import {playwright} from "@vitest/browser-playwright";

const viewportSize = {width: 800, height: 600};

export default defineConfig({
  test: {
    browser: {
      provider: playwright(),
      enabled: true,
      headless: true,
      instances: [
        {
          browser: "chromium",
        },
      ],
      screenshotFailures: false,
      viewport: viewportSize,
    },
    provide: {viewportSize},
    setupFiles: ["./tests/custom-matchers.mjs"],
  }
});
