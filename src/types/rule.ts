import type { JSRuleDefinition } from "eslint";
import type { BaseIssue, BaseSchema, Default, InferOutput, ObjectSchema, OptionalSchema } from "valibot";

import type { CommonOptions } from "better-tailwindcss:options/descriptions.js";
import type { Literal } from "better-tailwindcss:types/ast.js";


export enum MatcherType {
  /** Matches all object keys that are strings. */
  ObjectKey = "objectKeys",
  /** Matches all object values that are strings. */
  ObjectValue = "objectValues",
  /** Matches all strings  that are not matched by another matcher. */
  String = "strings"
}

export type Regex = string;

export type StringMatcher = {
  match: MatcherType.String;
};

export type ObjectKeyMatcher = {
  match: MatcherType.ObjectKey;
  pathPattern?: Regex;
};

export type ObjectValueMatcher = {
  match: MatcherType.ObjectValue;
  pathPattern?: Regex;
};

export type MatcherFunction<Node> = (node: unknown) => node is Node;
export type MatcherFunctions<Node> = MatcherFunction<Node>[];
export type Matcher = ObjectKeyMatcher | ObjectValueMatcher | StringMatcher;


export type TailwindConfig = {
  entryPoint?: string;
  tailwindConfig?: string;
};

export type TSConfig = {
  tsconfig?: string;
};


export type Schema = ObjectSchema<Record<string, OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, undefined>>>, undefined>;
export type JsonSchema<RawSchema extends Schema> = InferOutput<RawSchema>;

export type CreateRule = <
  const Messages extends string = string,
  const OptionsSchema extends Schema = Schema
>(options: {
  /** Whether the rule should automatically fix problems. */
  autofix: boolean;
  /** The category of the rule. */
  category: "correctness" | "stylistic";
  /** A brief description of the rule. */
  description: string;
  /** The URL to the rule documentation. */
  docs: string;
  /** Lint the literals in the given context. */
  lintLiterals: (
    ctx: Parameters<JSRuleDefinition<{ MessageIds: Messages; RuleOptions: [Required<JsonSchema<CommonOptions & OptionsSchema>>]; }>["create"]>[0],
    literals: Literal[]
  ) => void;
  /** The name of the rule. */
  name: string;
  /** Whether the rule is enabled in the recommended configs. */
  recommended: boolean;
  initialize?: () => void;
  /** The messages for the rule. */
  messages?: Record<Messages, string>;
  /** The schema for the rule options. */
  schema?: OptionsSchema;
}) => ESLintRule<Messages, OptionsSchema>;

export interface ESLintRule<Messages extends string = string, OptionsSchema extends Schema = Schema> {
  name: string;
  rule: JSRuleDefinition<{ MessageIds: Messages; RuleOptions: [Required<JsonSchema<CommonOptions & OptionsSchema>>]; }>;
  schema?: OptionsSchema;
}

export type Context<Rule extends ESLintRule = ESLintRule> = Parameters<Rule["rule"]["create"]>[0];

export type MessageId<Ctx extends Context> = Parameters<Ctx["report"]>[0] extends infer Obj
  ? Obj extends { messageId: any; }
    ? Obj["messageId"]
    : never
  : never;
