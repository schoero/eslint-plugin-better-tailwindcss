import { env } from "node:process";

import { TsRunner } from "synckit";

import type { SynckitOptions } from "synckit";


const defaultTimeout = 30_000;

export function getWorkerOptions(): SynckitOptions | undefined {
  if(env.NODE_ENV === "test"){
    return {
      timeout: Number(env.SYNCKIT_TIMEOUT) || defaultTimeout,
      tsRunner: TsRunner.OXC
    };
  } else {
    return {
      timeout: Number(env.SYNCKIT_TIMEOUT) || defaultTimeout
    };
  }
}
