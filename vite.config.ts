import { config } from "@schoero/configs/vite";
import { defineConfig } from "vitest/config";


export default defineConfig({
  ...config,
  test: {
    disableConsoleIntercept: true,
    env: {
      NO_CACHE: "true"
    },
    fileParallelism: false,
    testTimeout: 10_000
  }
});
