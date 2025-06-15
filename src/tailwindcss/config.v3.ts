import { findFileRecursive } from "better-tailwindcss:utils/fs.js";


export function findTailwindConfigPath(cwd: string, configPath?: string): string | undefined {
  const potentialPaths = [
    ...configPath ? [configPath] : [],
    "tailwind.config.js",
    "tailwind.config.cjs",
    "tailwind.config.mjs",
    "tailwind.config.ts"
  ];

  return findFileRecursive(cwd, potentialPaths);
}
