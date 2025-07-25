import { getTailwindConfigPath } from "./config.js";
import { getTSConfigPath } from "./tsconfig.js";
import { getTailwindcssVersion } from "./version.js";

import type { Warning } from "../types/async.js";


export interface AsyncContext {
  cwd: string;
  tailwindConfigPath: string;
  tsconfigPath: string | undefined;
  version: { major: number; minor: number; patch: number; };
}

export interface GetAsyncContextRequest {
  cwd: string;
  configPath?: string;
  tsconfigPath?: string;
}

export interface GetAsyncContextResponse {
  ctx: AsyncContext;
  warnings: (Warning | undefined)[];
}


export async function getAsyncContext({ configPath, cwd, tsconfigPath }: GetAsyncContextRequest): Promise<GetAsyncContextResponse> {

  const version = getTailwindcssVersion();

  const { path: resolvedTailwindPath, warnings: tailwindConfigWarnings } = getTailwindConfigPath({ configPath, cwd, version });
  const { path: resolvedTSConfigPath, warnings: tsconfigWarnings } = getTSConfigPath({ configPath: tsconfigPath, cwd });

  return {
    ctx: {
      cwd,
      tailwindConfigPath: resolvedTailwindPath,
      tsconfigPath: resolvedTSConfigPath,
      version
    },
    warnings: [...tailwindConfigWarnings, ...tsconfigWarnings]
  };
}
