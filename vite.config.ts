import { config } from "@schoero/configs/vite";
import { defineConfig } from "vitest/config";


export default defineConfig({
  ...config,
  test: {
    fileParallelism: false,
    maxConcurrency: 1,
    maxWorkers: 1
  }
});
