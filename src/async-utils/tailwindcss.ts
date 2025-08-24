import { existsSync, readFileSync } from "node:fs";
import { cwd } from "node:process";

import { withCache } from "./cache.js";
import { resolveJson } from "./resolvers.js";


export const enum TailwindcssVersion {
  V3 = 3,
  V4 = 4
}

export function isTailwindcssInstalled(): boolean {
  try {
    return existsSync(resolveJson("tailwindcss/package.json", cwd()));
  } catch {
    return false;
  }
}

export type SupportedTailwindVersion = TailwindcssVersion.V3 | TailwindcssVersion.V4;

export function isSupportedVersion(version: number): version is SupportedTailwindVersion {
  return version === TailwindcssVersion.V3 || version === TailwindcssVersion.V4;
}

export function isTailwindcssVersion3(version: number): version is TailwindcssVersion.V3 {
  return version === TailwindcssVersion.V3;
}

export function isTailwindcssVersion4(version: number): version is TailwindcssVersion.V4 {
  return version === TailwindcssVersion.V4;
}

export function getTailwindcssVersion() {
  const packageJsonPath = resolveJson("tailwindcss/package.json", cwd());

  return withCache("version", packageJsonPath, () => {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      return parseSemanticVersion(packageJson.version);
    } catch {
      throw new Error("Error reading Tailwind CSS package.json");
    }
  });
}

function parseSemanticVersion(version: string): { major: number; minor: number; patch: number; identifier?: string; } {
  const [major, minor, patchString] = version.split(".");
  const [patch, identifier] = patchString.split("-");

  return { identifier, major: +major, minor: +minor, patch: +patch };
}
