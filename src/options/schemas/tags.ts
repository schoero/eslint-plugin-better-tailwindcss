import {
  array,
  description,
  optional,
  pipe,
  strictObject,
  string,
  tuple,
  union
} from "valibot";

import {
  OBJECT_KEY_MATCHER_SCHEMA,
  OBJECT_VALUE_MATCHER_SCHEMA,
  STRING_MATCHER_SCHEMA
} from "better-tailwindcss:options/schemas/matchers.js";

import type { InferOutput } from "valibot";


const TAG_MATCHER_CONFIG = pipe(
  tuple([
    pipe(
      string(),
      description("Template literal tag for which children get linted if matched.")
    ),
    pipe(
      array(
        union([
          STRING_MATCHER_SCHEMA,
          OBJECT_KEY_MATCHER_SCHEMA,
          OBJECT_VALUE_MATCHER_SCHEMA
        ])
      ),
      description("List of matchers that will be applied.")
    )
  ]),
  description("List of matchers that will automatically be matched.")
);

export type TagMatchers = InferOutput<typeof TAG_MATCHER_CONFIG>;

const TAG_NAME_CONFIG = pipe(
  string(),
  description("Template literal tag that should get linted.")
);

export type TagName = InferOutput<typeof TAG_NAME_CONFIG>;

export const TAGS_SCHEMA = pipe(
  array(
    union([
      TAG_MATCHER_CONFIG,
      TAG_NAME_CONFIG
    ])
  ),
  description("List of template literal tags that should get linted.")
);

export type Tags = InferOutput<typeof TAGS_SCHEMA>;

export const TAGS_OPTIONS_SCHEMA = strictObject({
  tags: optional(TAGS_SCHEMA)
});

export type TagsOptions = InferOutput<typeof TAGS_OPTIONS_SCHEMA>;
