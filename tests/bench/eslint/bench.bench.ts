import { loadESLint } from "eslint";
import {  test } from "vitest";


test("bench/eslint", async ({ bench }) => {

  const ESLint = await loadESLint();

  bench("ESLint recommended (cold)", async () => {
    const eslint = new ESLint({
      cwd: import.meta.dirname,
      overrideConfigFile: "./eslint.config.js"
    });

    await eslint.lintFiles("./test.tsx");
  }).run();

  const eslint = new ESLint({
    cwd: import.meta.dirname,
    overrideConfigFile: "./eslint.config.js"
  });

  bench("ESLint recommended (warm)", async () => {
    await eslint.lintFiles("./test.tsx");
  }).run();

});
