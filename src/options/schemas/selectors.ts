import {
  array,
  description,
  literal,
  number,
  optional,
  pipe,
  strictObject,
  string,
  union
} from "valibot";

import { DEFAULT_SELECTORS } from "better-tailwindcss:options/default-options.js";
import { MatcherType, SelectorKind } from "better-tailwindcss:types/rule.js";

import type { InferOutput } from "valibot";


const STRING_SELECTOR_MATCHER_SCHEMA = strictObject({
  type: pipe(
    literal(MatcherType.String),
    description("Matcher type that will be applied.")
  )
});

const OBJECT_KEY_SELECTOR_MATCHER_SCHEMA = strictObject({
  pathPattern: optional(pipe(
    string(),
    description("Regular expression that filters the object key and matches the content for further processing in a group.")
  )),
  type: pipe(
    literal(MatcherType.ObjectKey),
    description("Matcher type that will be applied.")
  )
});

const OBJECT_VALUE_SELECTOR_MATCHER_SCHEMA = strictObject({
  pathPattern: optional(pipe(
    string(),
    description("Regular expression that filters the object value and matches the content for further processing in a group.")
  )),
  type: pipe(
    literal(MatcherType.ObjectValue),
    description("Matcher type that will be applied.")
  )
});

const SELECTOR_MATCH_SCHEMA = pipe(
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
);

const SELECTOR_NAME_SCHEMA = pipe(
  string(),
  description("Regular expression for names that should be linted.")
);

const CALLEE_SELECTOR_PATH_SCHEMA = pipe(
  string(),
  description("Regular expression for callee paths that should be linted.")
);

const CALLEE_SELECTOR_CALL_TARGET_SCHEMA = pipe(
  optional(
    union([
      literal("all"),
      literal("first"),
      literal("last"),
      number()
    ])
  ),
  description("Optional call target for curried callees: index, first, last, or all.")
);

const ATTRIBUTE_SELECTOR_SCHEMA = strictObject({
  kind: pipe(
    literal(SelectorKind.Attribute),
    description("Selector kind that determines where matching is applied.")
  ),
  match: SELECTOR_MATCH_SCHEMA,
  name: SELECTOR_NAME_SCHEMA
});

const CALLEE_SELECTOR_SCHEMA = union([
  strictObject({
    callTarget: CALLEE_SELECTOR_CALL_TARGET_SCHEMA,
    kind: pipe(
      literal(SelectorKind.Callee),
      description("Selector kind that determines where matching is applied.")
    ),
    match: SELECTOR_MATCH_SCHEMA,
    name: SELECTOR_NAME_SCHEMA,
    path: optional(CALLEE_SELECTOR_PATH_SCHEMA)
  }),
  strictObject({
    callTarget: CALLEE_SELECTOR_CALL_TARGET_SCHEMA,
    kind: pipe(
      literal(SelectorKind.Callee),
      description("Selector kind that determines where matching is applied.")
    ),
    match: SELECTOR_MATCH_SCHEMA,
    name: optional(SELECTOR_NAME_SCHEMA),
    path: CALLEE_SELECTOR_PATH_SCHEMA
  })
]);

const TAG_SELECTOR_SCHEMA = strictObject({
  kind: pipe(
    literal(SelectorKind.Tag),
    description("Selector kind that determines where matching is applied.")
  ),
  match: SELECTOR_MATCH_SCHEMA,
  name: SELECTOR_NAME_SCHEMA
});

const VARIABLE_SELECTOR_SCHEMA = strictObject({
  kind: pipe(
    literal(SelectorKind.Variable),
    description("Selector kind that determines where matching is applied.")
  ),
  match: SELECTOR_MATCH_SCHEMA,
  name: SELECTOR_NAME_SCHEMA
});

export const SELECTOR_SCHEMA = union([
  ATTRIBUTE_SELECTOR_SCHEMA,
  CALLEE_SELECTOR_SCHEMA,
  TAG_SELECTOR_SCHEMA,
  VARIABLE_SELECTOR_SCHEMA
]);

export type Selector = InferOutput<typeof SELECTOR_SCHEMA>;

export const SELECTORS_SCHEMA = pipe(
  array(SELECTOR_SCHEMA),
  description("Flat list of selectors that should get linted.")
);

export type Selectors = InferOutput<typeof SELECTORS_SCHEMA>;

export const SELECTORS_OPTION_SCHEMA = strictObject({
  selectors: optional(SELECTORS_SCHEMA, DEFAULT_SELECTORS)
});

export type SelectorsOptions = InferOutput<typeof SELECTORS_OPTION_SCHEMA>;
