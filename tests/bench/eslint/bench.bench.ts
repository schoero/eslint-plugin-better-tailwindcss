import { loadESLint } from "eslint";
import { bench, describe } from "vitest";


describe("bench/eslint", async () => {

  const ESLint = await loadESLint();

  bench("ESLint recommended (cold)", async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: "./eslint.config.js"
    });

    await eslint.lintFiles("./test.tsx");
  });

  const eslint = new ESLint({
    cwd: import.meta.dirname,
    overrideConfigFile: "./eslint.config.js"
  });

  bench("ESLint recommended (warm)", async () => {
    await eslint.lintFiles("./test.tsx");
  });

});
