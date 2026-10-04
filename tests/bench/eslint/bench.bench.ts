import { loadESLint } from "eslint";
import {  resolve } from "node:path";
import { test } from "vitest";


const benchDir = import.meta.dirname;
const benchRoot = resolve(benchDir, "..");
const configFile = resolve(benchDir, "./eslint.config.js");

test("bench/eslint", async ({ bench }) => {

  const ESLint = await loadESLint();

  await bench("ESLint recommended (cold)", async () => {
    const eslint = new ESLint({
      cwd: benchRoot,
      overrideConfigFile: configFile
    });

    await eslint.lintFiles("./shared");
  }).run();

  const eslint = new ESLint({
    cwd: benchRoot,
    overrideConfigFile: configFile
  });

  await bench("ESLint recommended (warm)", async () => {
    await eslint.lintFiles("./shared");
  }).run();

});
