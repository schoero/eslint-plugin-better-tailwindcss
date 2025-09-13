import { env } from "node:process";

import { TsRunner } from "synckit";

import type { SynckitOptions } from "synckit";


export function getWorkerOptions(): SynckitOptions | undefined {
  if(env.NODE_ENV === "test"){
    return {
      timeout: 10_000,
      tsRunner: TsRunner.OXC
    };
  } else {
    return {
      timeout: 10_000
    };
  }
}
