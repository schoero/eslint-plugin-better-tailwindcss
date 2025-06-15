import { findFileRecursive } from "better-tailwindcss:utils/fs.js";
import { cssResolver } from "better-tailwindcss:utils/resolvers.js";


export function findTailwindConfigPath(cwd: string, configPath?: string): string | undefined {
  const potentialStylesheetPaths = [
    ...configPath ? [configPath] : []
  ];

  return findFileRecursive(cwd, potentialStylesheetPaths);
}

export function findDefaultConfigPath(cwd: string): string {
  const defaultConfigPath = cssResolver.resolveSync({}, cwd, "tailwindcss/theme.css");

  if(!defaultConfigPath){
    throw new Error("No default tailwind config found. Please ensure you have Tailwind CSS installed.");
  }

  return defaultConfigPath;
}
