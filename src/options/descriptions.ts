import { object } from "valibot";

import { ATTRIBUTES_OPTION_SCHEMA } from "better-tailwindcss:options/schemas/attributes.js";
import { CALLEES_OPTION_SCHEMA } from "better-tailwindcss:options/schemas/callees.js";
import {
  DETECT_COMPONENT_CLASSES_OPTION_SCHEMA,
  ENTRYPOINT_OPTION_SCHEMA,
  TAILWIND_OPTION_SCHEMA,
  TSCONFIG_OPTION_SCHEMA
} from "better-tailwindcss:options/schemas/common.js";
import { TAGS_OPTIONS_SCHEMA } from "better-tailwindcss:options/schemas/tags.js";
import { VARIABLES_OPTION_SCHEMA } from "better-tailwindcss:options/schemas/variables.js";

import type { InferOutput } from "valibot";


export const COMMON_OPTIONS = object({
  ...CALLEES_OPTION_SCHEMA.entries,
  ...ATTRIBUTES_OPTION_SCHEMA.entries,
  ...VARIABLES_OPTION_SCHEMA.entries,
  ...TAGS_OPTIONS_SCHEMA.entries,
  ...ENTRYPOINT_OPTION_SCHEMA.entries,
  ...TAILWIND_OPTION_SCHEMA.entries,
  ...TSCONFIG_OPTION_SCHEMA.entries,
  ...DETECT_COMPONENT_CLASSES_OPTION_SCHEMA.entries
});

export type CommonOptions = InferOutput<typeof COMMON_OPTIONS>;
