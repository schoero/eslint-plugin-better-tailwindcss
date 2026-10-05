import { env } from "node:process";

import { config } from "@schoero/configs/vite";
import { defineConfig } from "vitest/config";


export default defineConfig({
  ...config,
  test: {
    disableConsoleIntercept: true,
    fileParallelism: false,
    globalSetup: "./tests/utils/setup.ts",
    testTimeout: env.CI ? 30_000 : Infinity
  }
});
