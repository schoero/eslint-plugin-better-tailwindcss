import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { cache, cacheKey, MISSING_FILE } from "better-tailwindcss:utils/cache.js";
import { resolveJson } from "better-tailwindcss:utils/resolvers.js";
import { parseSemanticVersion } from "better-tailwindcss:utils/version.js";

import type { Version } from "better-tailwindcss:types/rule.js";


interface TailwindPackage {
  installation: string;
  version: Version;
}

// called for every rule and every linted file
export function getTailwindPackage(cwd: string): TailwindPackage | undefined {
  const key = cacheKey("tailwind-package", cwd);

  if(cache.has(key)){
    return cache.get<TailwindPackage | undefined>(key);
  }

  const candidates = getInstallationCandidates(cwd);
  const packageJsonPath = resolveJson("tailwindcss/package.json", cwd);

  const tailwindPackage = packageJsonPath
    ? {
      installation: dirname(packageJsonPath),
      version: parseSemanticVersion(JSON.parse(readFileSync(packageJsonPath, "utf-8")).version)
    }
    : undefined;

  // the resolved path is a real path, which contains the version for pnpm. The candidates follow the symlink,
  // so they change when tailwind is installed, updated or removed in any of the directories it is resolved from.
  cache.set(key, tailwindPackage, { files: [...candidates, ...packageJsonPath ? [packageJsonPath] : []] });

  return tailwindPackage;
}

function getInstallationCandidates(cwd: string) {
  const candidates: string[] = [];

  for(let directory = cwd; ; directory = dirname(directory)){
    const candidate = join(directory, "node_modules", "tailwindcss", "package.json");

    candidates.push(candidate);

    if(cache.modified(candidate) !== MISSING_FILE || dirname(directory) === directory){
      return candidates;
    }
  }
}
