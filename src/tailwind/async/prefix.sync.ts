// runner.js
import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getWorkerOptions } from "better-tailwindcss:tailwind/utils/worker.js";

import { getTailwindcssVersion, isSupportedVersion, TailwindcssVersion } from "../utils/version.js";

import type { GetPrefixRequest, GetPrefixResponse } from "../api/interface.js";
import type { SupportedTailwindVersion } from "../utils/version.js";


const workerPath = getWorkerPath();
const version = getTailwindcssVersion();
const workerOptions = getWorkerOptions();

const getPrefixSync = createSyncFn<(version: SupportedTailwindVersion, request: GetPrefixRequest) => GetPrefixResponse>(workerPath, workerOptions);


export function getPrefix(request: GetPrefixRequest) {
  if(!isSupportedVersion(version.major)){
    throw new Error(`Unsupported Tailwind CSS version: ${version.major}`);
  }

  const [prefix] = getPrefixSync(version.major, request);
  const suffix = prefix === ""
    ? ""
    : version.major === TailwindcssVersion.V3
      ? ""
      : ":";

  return [prefix, suffix];
}


function getWorkerPath() {
  return resolve(getCurrentDirectory(), "./prefix.async.js");
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
