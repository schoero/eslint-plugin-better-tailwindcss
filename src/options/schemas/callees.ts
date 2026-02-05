import {
  array,
  boolean,
  description,
  optional,
  pipe,
  strictObject,
  string,
  tuple,
  union
} from "valibot";

import { DEFAULT_CALLEE_NAMES } from "better-tailwindcss:options/default-options.js";
import {
  OBJECT_KEY_MATCHER_SCHEMA,
  OBJECT_VALUE_MATCHER_SCHEMA,
  STRING_MATCHER_SCHEMA
} from "better-tailwindcss:options/schemas/matchers.js";

import type { InferOutput } from "valibot";


const CALLEE_NAME_STRING_SCHEMA = pipe(
  string(),
  description("Callee name for which children get linted.")
);

const CALLEE_NAME_OBJECT_SCHEMA = strictObject({
  curried: optional(
    pipe(
      boolean(),
      description("Whether to match curried function calls recursively.")
    )
  ),
  name: CALLEE_NAME_STRING_SCHEMA
});

const CALLEE_NAME_SCHEMA = union([
  CALLEE_NAME_STRING_SCHEMA,
  CALLEE_NAME_OBJECT_SCHEMA
]);

export type CalleeNameObject = InferOutput<typeof CALLEE_NAME_OBJECT_SCHEMA>;
export type CalleeName = InferOutput<typeof CALLEE_NAME_SCHEMA>;

const CALLEE_MATCHER_LIST_SCHEMA = pipe(
  array(
    union([
      STRING_MATCHER_SCHEMA,
      OBJECT_KEY_MATCHER_SCHEMA,
      OBJECT_VALUE_MATCHER_SCHEMA
    ])
  ),
  description("List of matchers that will be applied.")
);

export type CalleeMatcherList = InferOutput<typeof CALLEE_MATCHER_LIST_SCHEMA>;

const CALLEE_MATCHER_SCHEMA = pipe(
  tuple([
    CALLEE_NAME_SCHEMA,
    CALLEE_MATCHER_LIST_SCHEMA
  ]),
  description("List of matchers that will automatically be matched.")
);

export type CalleeMatchers = InferOutput<typeof CALLEE_MATCHER_SCHEMA>;

export const CALLEES_SCHEMA = pipe(
  array(
    union([
      CALLEE_MATCHER_SCHEMA,
      CALLEE_NAME_SCHEMA
    ])
  ),
  description("List of function names which arguments should get linted.")
);

export type Callees = InferOutput<typeof CALLEES_SCHEMA>;

export const CALLEES_OPTION_SCHEMA = strictObject({
  callees: optional(CALLEES_SCHEMA, DEFAULT_CALLEE_NAMES)
});

export type CalleesOptions = InferOutput<typeof CALLEES_OPTION_SCHEMA>;

export type NormalizedCallee = [CalleeNameObject, CalleeMatcherList?];
