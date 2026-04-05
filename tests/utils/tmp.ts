import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, resolve } from "node:path";
import { chdir } from "node:process";
import { fileURLToPath } from "node:url";

import eslintPluginBetterTailwindCSS from "better-tailwindcss:configs/config.js";


type TestDirectoryFiles<Files extends Record<string, string>> = {
  [File in keyof Files]: { content: Files[File]; path: File; };
};

export class TestDirectory<Files extends Record<string, string> = Record<string, string>> {

  private cwd = process.cwd();
  private storage: Files | undefined;

  public readonly directory: string;

  constructor(files?: Files, isolated: boolean = false) {
    const randomDir = Math.random()
      .toString(36)
      .substring(2, 6);

    this.directory = resolve(getTestDirectoryBasePath(isolated), randomDir);

    mkdirSync(this.directory, { recursive: true });

    chdir(this.directory);

    if(files){
      this.storage = files;

      for(const name in files){
        mkdirSync(join(this.directory, dirname(name)), { recursive: true });
        writeFileSync(join(this.directory, name), files[name]);
      }
    }

  }

  public get files(): TestDirectoryFiles<Files> {
    const storage = this.storage;
    const directory = this.directory;

    return new Proxy({} as TestDirectoryFiles<Files>, {
      get(_, key) {
        if(typeof key !== "string"){
          return;
        }
        return { content: storage?.[key], path: join(directory, key) };
      }
    });
  }

  public cleanUp() {
    chdir(this.cwd);
    cleanUpTestDirectory(this.directory);
  }

  [Symbol.dispose]() {
    this.cleanUp();
  }

}

function getProjectRoot() {
  return resolve(dirname(fileURLToPath(import.meta.url)), "../../");
}

function getTestDirectoryBasePath(isolated: boolean = false) {
  return resolve(
    isolated
      ? tmpdir()
      : join(getProjectRoot(), "tmp"),
    eslintPluginBetterTailwindCSS.meta.name
  );
}

export function cleanUpTestDirectory(path?: string) {
  const isolatedBasePath = getTestDirectoryBasePath(true);
  const basePath = getTestDirectoryBasePath();

  if(path){
    const resolvedPath = resolve(path);
    if(!isAbsolute(resolvedPath) || !resolvedPath.startsWith(isolatedBasePath) && !resolvedPath.startsWith(basePath)){
      throw new Error(`Invalid path: ${path}`);
    }

    rmSync(path, { force: true, recursive: true });
  } else {
    rmSync(isolatedBasePath, { force: true, recursive: true });
    rmSync(basePath, { force: true, recursive: true });
  }

}
