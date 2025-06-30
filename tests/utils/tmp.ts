import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { cwd } from "node:process";


const TESTING_DIRECTORY = "tmp";

export function goToTestingDirectory() {
  if(basename(cwd()) === TESTING_DIRECTORY){
    return;
  }

  process.chdir(TESTING_DIRECTORY);
}

export function resetTestingDirectory() {
  if(basename(cwd()) === TESTING_DIRECTORY){
    process.chdir("..");
  }
  if(existsSync(TESTING_DIRECTORY)){
    rmSync(TESTING_DIRECTORY, { recursive: true });
  }
  mkdirSync(TESTING_DIRECTORY, { recursive: true });
  goToTestingDirectory();
}

export function createTestFile(name: string, content: string) {
  goToTestingDirectory();
  mkdirSync(dirname(name), { recursive: true });
  writeFileSync(name, content);
}
