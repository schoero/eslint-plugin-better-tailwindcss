import {
  array,
  description,
  literal,
  optional,
  pipe,
  strictObject,
  string,
  union
} from "valibot";

import {
  OBJECT_KEY_SELECTOR_MATCHER_SCHEMA,
  OBJECT_VALUE_SELECTOR_MATCHER_SCHEMA,
  STRING_SELECTOR_MATCHER_SCHEMA
} from "better-tailwindcss:options/schemas/matchers.js";
import { SelectorKind } from "better-tailwindcss:types/rule.js";

import type { InferOutput } from "valibot";


export const SELECTOR_SCHEMA = strictObject({
  kind: pipe(
    union([
      literal(SelectorKind.Attribute),
      literal(SelectorKind.Callee),
      literal(SelectorKind.Tag),
      literal(SelectorKind.Variable)
    ]),
    description("Selector kind that determines where matching is applied.")
  ),
  match: pipe(
    optional(
      array(
        union([
          STRING_SELECTOR_MATCHER_SCHEMA,
          OBJECT_KEY_SELECTOR_MATCHER_SCHEMA,
          OBJECT_VALUE_SELECTOR_MATCHER_SCHEMA
        ])
      )
    ),
    description("Optional list of matchers that will be applied.")
  ),
  name: pipe(
    string(),
    description("Regular expression for names that should be linted.")
  )
});

export type Selector = InferOutput<typeof SELECTOR_SCHEMA>;

export const SELECTORS_SCHEMA = pipe(
  array(SELECTOR_SCHEMA),
  description("Flat list of selectors that should get linted.")
);

export type Selectors = InferOutput<typeof SELECTORS_SCHEMA>;

export const SELECTORS_OPTION_SCHEMA = strictObject({
  selectors: optional(SELECTORS_SCHEMA, [])
});

export type SelectorsOptions = InferOutput<typeof SELECTORS_OPTION_SCHEMA>;
