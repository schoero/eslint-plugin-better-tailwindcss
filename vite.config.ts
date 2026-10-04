import { config } from "@schoero/configs/vite";
import { defineConfig } from "vitest/config";


export default defineConfig({
  ...config,
  test: {
    benchmark: {
      time: 5000
    },
    disableConsoleIntercept: true,
    fileParallelism: false,
    globalSetup: "./tests/utils/setup.ts",
    testTimeout: 10_000
  }
});
