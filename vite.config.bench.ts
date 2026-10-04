import { defineConfig } from "vitest/config";

import config from "./vite.config.js";


export default defineConfig({
  ...config,
  test: {
    ...config.test,
    dir: "./tests/bench",
    testTimeout: 500_000
  }
});
