import type { JSRuleDefinition } from "eslint";
import type { JSONSchema4 } from "json-schema";
import type { BaseIssue, BaseSchema, Default, InferOutput, ObjectSchema, OptionalSchema } from "valibot";

import type { CommonOptions } from "better-tailwindcss:options/descriptions.js";
import type { CALLEES_SCHEMA } from "better-tailwindcss:options/schemas/callees.js";
import type { Literal } from "better-tailwindcss:types/ast.js";


export enum MatcherType {
  /** Matches all object keys that are strings. */
  ObjectKey = "objectKeys",
  /** Matches all object values that are strings. */
  ObjectValue = "objectValues",
  /** Matches all strings  that are not matched by another matcher. */
  String = "strings"
}

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

export type Regex = string;

export type CalleeName = string;
export type CalleeMatchers = InferOutput<typeof CALLEE_MATCHER_CONFIG>;
export type CalleeRegex = InferOutput<typeof CALLEE_REGEX_CONFIG>;
export type CalleeOption = InferOutput<typeof CALLEES_SCHEMA>;
export type Callees = InferOutput<typeof CALLEES_SCHEMA>;

export type VariableName = string;
export type VariableMatchers = [variable: VariableName, matchers: Matcher[]];
export type VariableRegex = [variableNameRegex: Regex, literalRegex: Regex];
export type Variables = (VariableMatchers | VariableName | VariableRegex)[];
export type VariableOption = {
  variables: Variables;
};

export type TagName = string;
export type TagMatchers = [tag: TagName, matchers: Matcher[]];
export type TagRegex = [tagRegex: Regex, literalRegex: Regex];
export type Tags = (TagMatchers | TagName | TagRegex)[];
export type TagOption = {
  tags: Tags;
};

export type AttributeName = string;
export type AttributeMatchers = [attribute: AttributeName, matchers: Matcher[]];
export type AttributeRegex = [attributeRegex: Regex, literalRegex: Regex];
export type Attributes = (AttributeMatchers | AttributeName | AttributeRegex)[];
export type AttributeOption = {
  attributes: Attributes;
};

export type NameConfig = AttributeName | CalleeName | VariableName;
export type RegexConfig = AttributeRegex | CalleeRegex | VariableRegex;
export type MatchersConfig = AttributeMatchers | CalleeMatchers | VariableMatchers;

export type TailwindConfig = {
  entryPoint?: string;
  tailwindConfig?: string;
};

export type TSConfig = {
  tsconfig?: string;
};


export type GlobalOptions =
  AttributeOption &
  CalleeOption &
  TagOption &
  TailwindConfig &
  TSConfig &
  VariableOption;

export type Schema = ObjectSchema<Record<string, OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, undefined>>>, undefined>;
export type JsonSchema<RawSchema extends Schema> = InferOutput<RawSchema>;

export type CreateRule = <
  const Messages extends string,
  const Options extends CommonOptions & JsonSchema<OptionsSchema>,
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
    ctx: Parameters<JSRuleDefinition<{ MessageIds: Messages; RuleOptions: [Options]; }>["create"]>[0],
    literals: Literal[]
  ) => void;
  /** The messages for the rule. */
  messages: Record<Messages, string>;
  /** The name of the rule. */
  name: string;
  /** Whether the rule is enabled in the recommended configs. */
  recommended: boolean;
  /** The schema for the rule options. */
  schema: OptionsSchema;
  initialize?: () => void;
}) => ESLintRule<Messages, Options>;

export interface ESLintRule<Messages extends string = string, Options extends JSONSchema4 = {}> {
  name: string;
  rule: JSRuleDefinition<{ MessageIds: Messages; RuleOptions: [Options]; }>;
}

export type Context<Rule extends ESLintRule = ESLintRule> = Parameters<Rule["rule"]["create"]>[0];
