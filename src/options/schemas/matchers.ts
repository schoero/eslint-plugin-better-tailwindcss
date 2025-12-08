import { description, literal, object, optional, pipe, string } from "valibot";

import { MatcherType } from "better-tailwindcss:types/rule.js";

import type { Rule } from "eslint";


export const STRING_MATCHER_SCHEMA = object({
  match: pipe(
    literal(MatcherType.String),
    description("Matcher type that will be applied.")
  )
}) satisfies Rule.RuleMetaData["schema"];

export const OBJECT_KEY_MATCHER_SCHEMA = object({
  match: pipe(
    literal(MatcherType.ObjectKey),
    description("Matcher type that will be applied.")
  ),
  pathPattern: optional(pipe(
    string(),
    description("Regular expression that filters the object key and matches the content for further processing in a group.")
  ))
}) satisfies Rule.RuleMetaData["schema"];

export const OBJECT_VALUE_MATCHER_SCHEMA = object({
  match: pipe(
    literal(MatcherType.ObjectValue),
    description("Matcher type that will be applied.")
  ),
  pathPattern: optional(pipe(
    string(),
    description("Regular expression that filters the object value and matches the content for further processing in a group.")
  ))
}) satisfies Rule.RuleMetaData["schema"];
