import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

import { afterAll, describe, expect, it } from "vitest";

import ts from "typescript";


const directory = resolve(import.meta.dirname, "../../../tmp/e2e-types");
const declarationsPath = resolve(import.meta.dirname, "../../../lib/api/types.js");
const declarationsSpecifier = relative(directory, declarationsPath).replaceAll("\\", "/");

function getDiagnostics(source: string) {
  const file = join(directory, `${Math.random().toString(36).substring(2, 8)}.ts`);

  mkdirSync(directory, { recursive: true });
  writeFileSync(file, source);

  const program = ts.createProgram([file], {
    module: ts.ModuleKind.NodeNext,
    moduleResolution: ts.ModuleResolutionKind.NodeNext,
    noEmit: true,
    skipLibCheck: true,
    strict: true,
    target: ts.ScriptTarget.ES2022,
    types: []
  });

  return ts.getPreEmitDiagnostics(program).map(({ code, messageText }) => ({
    code,
    message: ts.flattenDiagnosticMessageText(messageText, "\n")
  }));
}

describe("e2e/types", () => {

  afterAll(() => {
    rmSync(directory, { force: true, recursive: true });
  });

  // The exported declarations are only available after `npm run build`
  it("should expose the settings as a type that TypeScript can resolve", () => {
    const diagnostics = getDiagnostics(`
      import { SelectorKind } from "${declarationsSpecifier}";

      import type { Settings } from "${declarationsSpecifier}";

      type SettingsAlias = Settings;
      type SettingsCwd = Settings["cwd"];
      type SettingsSubset = Pick<Settings, "cwd">;
      type SettingsRest = Omit<Settings, "cwd">;

      export const settings = {
        cwd: ".",
        entryPoint: "styles.css",
        selectors: { extends: [{ kind: SelectorKind.Attribute, name: "^classNames$" }] }
      } satisfies Settings;

      export type { SettingsAlias, SettingsCwd, SettingsRest, SettingsSubset };
    `);

    expect(diagnostics).toEqual([]);
  });

  it("should reject unknown settings", () => {
    const diagnostics = getDiagnostics(`
      import type { Settings } from "${declarationsSpecifier}";

      export const settings = { cwd: ".", unknown: true } satisfies Settings;
    `);

    expect(diagnostics).toHaveLength(1);
    expect(diagnostics[0]?.message).toContain("'unknown' does not exist");
  });

});
