import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { test } from "vitest";


const execFileAsync = promisify(execFile);

const oxlintPackageJson = fileURLToPath(await import.meta.resolve("oxlint/package.json"));
const oxlintBinary = resolve(dirname(oxlintPackageJson), "bin/oxlint");
const sharedDir = resolve(dirname(fileURLToPath(import.meta.url)), "../shared");

test("bench/oxlint", { timeout: 120_000 }, async ({ bench }) => {

  await bench("Oxlint recommended", async () => {
    await execFileAsync(oxlintBinary, ["--config", "./oxlint.config.js", sharedDir], {
      cwd: import.meta.dirname
    });
  }).run();

});
