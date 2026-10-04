import { execFile } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

import { bench, describe } from "vitest";


const execFileAsync = promisify(execFile);

const oxlintPackageJson = fileURLToPath(await import.meta.resolve("oxlint/package.json"));
const oxlintBinary = resolve(dirname(oxlintPackageJson), "bin/oxlint");

describe("bench/oxlint", () => {

  bench("Oxlint recommended", async () => {
    await execFileAsync(oxlintBinary, ["--config", "./oxlint.config.ts", "./test.tsx"], {
      cwd: import.meta.dirname
    });
  }, { iterations: 20 });

});
