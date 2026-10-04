import { config } from "@schoero/configs/vite";
import { defineConfig } from "vitest/config";


export default defineConfig({
  ...config,
  test: {
    disableConsoleIntercept: true,
    fileParallelism: false,
    globalSetup: "./tests/utils/setup.ts",
    testTimeout: 10_000
  }
});
