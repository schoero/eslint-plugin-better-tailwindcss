import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Linter } from "eslint";

import { noUnknownClasses } from "better-tailwindcss:rules/no-unknown-classes.js";


// Simulates a monorepo where:
//   /monorepo-root/           <-- linter cwd (no tailwindcss here)
//   /monorepo-root/packages/website/node_modules/tailwindcss/  <-- installed here
//   /monorepo-root/packages/website/src/index.tsx  <-- file being linted

const MONOREPO_ROOT = join(tmpdir(), "eslint-btw-monorepo-test");
const WORKSPACE = join(MONOREPO_ROOT, "packages", "website");
const TAILWIND_PKG = join(WORKSPACE, "node_modules", "tailwindcss");

beforeAll(() => {
  rmSync(MONOREPO_ROOT, { recursive: true, force: true });

  // Create the workspace directory structure
  mkdirSync(join(WORKSPACE, "src"), { recursive: true });
  mkdirSync(join(MONOREPO_ROOT, "node_modules"), { recursive: true });

  // Create a minimal tailwindcss package in the workspace
  mkdirSync(TAILWIND_PKG, { recursive: true });
  writeFileSync(join(TAILWIND_PKG, "package.json"), JSON.stringify({
    name: "tailwindcss",
    version: "4.0.0",
    style: "index.css"
  }));
  writeFileSync(join(TAILWIND_PKG, "index.css"), "");
  mkdirSync(join(TAILWIND_PKG, "dist"), { recursive: true });
  writeFileSync(join(TAILWIND_PKG, "theme.css"), "");
});

afterAll(() => {
  rmSync(MONOREPO_ROOT, { recursive: true, force: true });
});


describe("monorepo resolution", () => {

  it("should resolve tailwindcss from the file's directory when not found in cwd", () => {
    const linter = new Linter({ cwd: MONOREPO_ROOT, configType: "flat" });

    const messages = linter.verify(
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
      { filename: join(WORKSPACE, "src", "index.tsx") }
    );

    // Should NOT contain "Tailwind CSS is not installed" — the plugin should
    // have resolved tailwindcss from the file's directory
    const installError = messages.find(m => m.message.includes("Tailwind CSS is not installed"));
    expect(installError).toBeUndefined();
  });

});
