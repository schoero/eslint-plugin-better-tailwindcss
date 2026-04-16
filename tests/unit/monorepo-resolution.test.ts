import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Linter } from "eslint";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { noUnknownClasses } from "better-tailwindcss:rules/no-unknown-classes.js";


// Simulates a monorepo where:
//   /monorepo-root/                                               <-- linter cwd (no tailwindcss here)
//   /monorepo-root/packages/website/node_modules/tailwindcss/     <-- installed here
//   /monorepo-root/packages/website/src/index.tsx                 <-- file being linted

const MONOREPO_ROOT = join(tmpdir(), "eslint-btw-monorepo-test");
const WORKSPACE = join(MONOREPO_ROOT, "packages", "website");
const TAILWIND_PKG = join(WORKSPACE, "node_modules", "tailwindcss");

beforeAll(() => {
  rmSync(MONOREPO_ROOT, { force: true, recursive: true });

  mkdirSync(join(WORKSPACE, "src"), { recursive: true });

  mkdirSync(TAILWIND_PKG, { recursive: true });
  writeFileSync(join(TAILWIND_PKG, "package.json"), JSON.stringify({
    name: "tailwindcss",
    style: "index.css",
    version: "4.0.0"
  }));
  writeFileSync(join(TAILWIND_PKG, "index.css"), "");
  mkdirSync(join(TAILWIND_PKG, "dist"), { recursive: true });
  writeFileSync(join(TAILWIND_PKG, "theme.css"), "");
});

afterAll(() => {
  rmSync(MONOREPO_ROOT, { force: true, recursive: true });
});


function lintFile(cwd: string, filename: string) {
  const linter = new Linter({ configType: "flat", cwd });
  return linter.verify(
    `export default () => <div className="flex" />;`,
    {
      languageOptions: {
        parserOptions: { ecmaFeatures: { jsx: true } }
      },
      plugins: {
        "rule-to-test": { rules: { [noUnknownClasses.name]: noUnknownClasses.rule } }
      },
      rules: { [`rule-to-test/${noUnknownClasses.name}`]: "warn" }
    },
    { filename }
  );
}


describe("monorepo resolution", () => {

  it("should resolve tailwindcss from the file's directory when linter cwd is the monorepo root", () => {
    const messages = lintFile(MONOREPO_ROOT, join(WORKSPACE, "src", "index.tsx"));

    const installError = messages.find(m => m.message.includes("Tailwind CSS is not installed"));
    expect(installError).toBeUndefined();
  });

  it("should resolve tailwindcss when linter cwd matches the workspace", () => {
    const messages = lintFile(WORKSPACE, join(WORKSPACE, "src", "index.tsx"));

    const installError = messages.find(m => m.message.includes("Tailwind CSS is not installed"));
    expect(installError).toBeUndefined();
  });

});
