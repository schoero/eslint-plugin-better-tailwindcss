import { description, object, optional, pipe, string } from "valibot";

import type { InferOutput } from "valibot";


export const ENTRYPOINT_OPTION_SCHEMA = object({
  entryPoint: optional(
    pipe(
      string(),
      description("The path to the css entry point of the project. If not specified, the plugin will fall back to the default tailwind classes.")
    )
  )
});

export type EntryPointOption = InferOutput<typeof ENTRYPOINT_OPTION_SCHEMA>;

export const TAILWIND_OPTION_SCHEMA = object({
  tailwindConfig: optional(
    pipe(
      string(),
      description("The path to the tailwind config file. If not specified, the plugin will try to find it automatically or falls back to the default configuration.")
    )
  )
});

export type TailwindConfigOption = InferOutput<typeof TAILWIND_OPTION_SCHEMA>;

export const TSCONFIG_OPTION_SCHEMA = object({
  tsconfig: optional(
    pipe(
      string(),
      description("The path to the tsconfig file. Is used to resolve path aliases in the tsconfig.")
    )
  )
});

export type TSConfigOption = InferOutput<typeof TSCONFIG_OPTION_SCHEMA>;
