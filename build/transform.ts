import { readFile, writeFile } from 'fs/promises';
import { glob } from 'glob'

export async function transformImports(globPatterns: string[], search: string, replace: string) {
  const files = await glob(globPatterns);

  for(const file of files) {
    const content = await readFile(file, 'utf-8');
    const transformed = content.replaceAll(search, replace);

    await writeFile(file, transformed);
  }
}

export async function transformDirname(globPatterns: string[]) {
  const files = await glob(globPatterns);

  for(const file of files) {
    const content = await readFile(file, 'utf-8');
    const transformed = content
      .replaceAll('import.meta.dirname', '__dirname')
      .replaceAll('import.meta.url', '__filename');

    await writeFile(file, transformed);
  }
}