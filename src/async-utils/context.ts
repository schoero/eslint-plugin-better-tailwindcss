import { withCache } from "./cache.js";
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

  const { context, warnings } = await withCache("async-context", async () => {
    const version = getTailwindcssVersion();

    const { path: resolvedTailwindPath, warnings: tailwindConfigWarnings } = getTailwindConfigPath({ configPath, cwd, version });
    const { path: resolvedTSConfigPath, warnings: tsconfigWarnings } = getTSConfigPath({ configPath: tsconfigPath, cwd });


    const context = {
      configPath,
      cwd,
      resolvedTailwindPath,
      resolvedTSConfigPath,
      tsconfigPath,
      version
    };

    return {
      context,
      warnings: [...tailwindConfigWarnings, ...tsconfigWarnings]
    };
  }, ({ value }) => {
    return (
      value.context.cwd !== cwd ||
      value.context.configPath !== configPath ||
      value.context.tsconfigPath !== tsconfigPath
    );
  });

  return {
    ctx: {
      cwd,
      tailwindConfigPath: context.resolvedTailwindPath,
      tsconfigPath: context.resolvedTSConfigPath,
      version: context.version
    },
    warnings
  };
}
