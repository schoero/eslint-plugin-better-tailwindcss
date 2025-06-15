import { resolve } from "node:path";

import { createSyncFn } from "synckit";

import { getTailwindConfigPath } from "better-tailwindcss:tailwindcss/config.js";
import { invalidateByModifiedDate, withCache } from "better-tailwindcss:utils/cache.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/version.js";
import { getWorkerOptions } from "better-tailwindcss:utils/worker.js";

import type { Async } from "better-tailwindcss:types/async.js";


export interface GetPrefixRequest {
  configPath: string;
}

export type GetPrefixResponse = string;

export function getPrefix({ configPath, cwd }: { configPath: string | undefined; cwd: string; }) {
  const version = getTailwindcssVersion();
  const { path, warning } = getTailwindConfigPath({ configPath, cwd });

  return withCache("prefix", () => {
    const prefix = getPrefixSync({ configPath: path });

    const suffix = version.major === TailwindcssVersion.V3 || prefix === ""
      ? ""
      : ":";

    return { prefix, suffix, warnings: [warning] };
  }, date => invalidateByModifiedDate(date, path));
}

const getPrefixSync = createSyncFn<
  Async<GetPrefixRequest, GetPrefixResponse>
>(getWorkerPath(), getWorkerOptions());

function getWorkerPath() {
  const { major } = getTailwindcssVersion();
  return resolve(getCurrentDirectory(), `./prefix.async.v${major}.js`);
}

function getCurrentDirectory() {
  // eslint-disable-next-line eslint-plugin-typescript/prefer-ts-expect-error
  // @ts-ignore - `import.meta` doesn't exist in CommonJS -> will be transformed in build step
  return import.meta.dirname;
}
