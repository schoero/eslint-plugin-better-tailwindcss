import type { JSRuleDefinition } from "eslint";
import type { BaseIssue, BaseSchema, Default, InferOutput, OptionalSchema, StrictObjectSchema } from "valibot";

import type { CommonOptions } from "better-tailwindcss:options/descriptions.js";
import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Warning } from "better-tailwindcss:types/async.js";


export enum MatcherType {
  /** Matches all object keys that are strings. */
  ObjectKey = "objectKeys",
  /** Matches all object values that are strings. */
  ObjectValue = "objectValues",
  /** Matches all strings  that are not matched by another matcher. */
  String = "strings"
}

export enum SelectorKind {
  Attribute = "attribute",
  Callee = "callee",
  Tag = "tag",
  Variable = "variable"
}

export type Regex = string;

export type StringMatcher = {
  match: MatcherType.String;
};

export type ObjectKeyMatcher = {
  match: MatcherType.ObjectKey;
  pathPattern?: Regex | undefined;
};

export type ObjectValueMatcher = {
  match: MatcherType.ObjectValue;
  pathPattern?: Regex | undefined;
};

export type MatcherFunction<Node> = (node: unknown) => node is Node;
export type MatcherFunctions<Node> = MatcherFunction<Node>[];
export type Matcher = ObjectKeyMatcher | ObjectValueMatcher | StringMatcher;

export type SelectorStringMatcher = {
  type: MatcherType.String;
};

export type SelectorObjectKeyMatcher = {
  type: MatcherType.ObjectKey;
  pathPattern?: Regex | undefined;
};

export type SelectorObjectValueMatcher = {
  type: MatcherType.ObjectValue;
  pathPattern?: Regex | undefined;
};

export type SelectorMatcher = SelectorObjectKeyMatcher | SelectorObjectValueMatcher | SelectorStringMatcher;

export type Selector<Kind extends SelectorKind = SelectorKind> = {
  kind: Kind;
  name: Regex;
  match?: SelectorMatcher[] | undefined;
};

export type AttributeSelector = Selector<SelectorKind.Attribute>;
export type CalleeSelector = Selector<SelectorKind.Callee>;
export type TagSelector = Selector<SelectorKind.Tag>;
export type VariableSelector = Selector<SelectorKind.Variable>;

export function isSelectorKind<Kind extends SelectorKind>(kind: Kind) {
  return (selector: Selector): selector is Selector<Kind> => selector.kind === kind;
}

export type Version = {
  major: number;
  minor: number;
  patch: number;
};

export type TailwindConfig = {
  entryPoint?: string;
  tailwindConfig?: string;
};

export type TSConfig = {
  tsconfig?: string;
};

export type Schema = StrictObjectSchema<Record<string, OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, undefined>>>, undefined>;
export type JsonSchema<RawSchema extends Schema> = InferOutput<RawSchema>;

export type RuleCategory = "correctness" | "stylistic";

export interface CreateRuleOptions<
  Name extends string,
  Messages extends Record<string, string>,
  OptionsSchema extends Schema = Schema,
  Options extends Record<string, any> = CommonOptions & JsonSchema<OptionsSchema>,
  Category extends RuleCategory = RuleCategory,
  Recommended extends boolean = boolean
> {
  /** Whether the rule should automatically fix problems. */
  autofix: boolean;
  /** The category of the rule. */
  category: Category;
  /** A brief description of the rule. */
  description: string;
  /** The URL to the rule documentation. */
  docs: string;
  /** Lint the literals in the given context. */
  lintLiterals: (ctx: RuleContext<Messages, Options>, literals: Literal[]) => void;
  /** The name of the rule. */
  name: Name;
  /** Whether the rule is enabled in the recommended configs. */
  recommended: Recommended;
  initialize?: (ctx: RuleContext<Messages, Options>) => void;
  /** The messages for the rule. */
  messages?: Messages;
  /** The schema for the rule options. */
  schema?: OptionsSchema;
}

export interface ESLintRule<
  Name extends string = string,
  Messages extends Record<string, string> = Record<string, string>,
  Options extends Record<string, any> = Record<string, any>,
  Category extends RuleCategory = RuleCategory,
  Recommended extends boolean = boolean
> {
  category: Category;
  messages: Messages | undefined;
  name: Name;
  get options(): Options;
  recommended: Recommended;
  rule: JSRuleDefinition<{
    MessageIds: keyof Messages & string;
    RuleOptions: [Required<Options>];
  }>;
}

export interface RuleContext<
  Messages extends Record<string, string> | undefined,
  Options extends Record<string, any>
> {
  cwd: string;
  docs: string;
  /** The installation path of Tailwind CSS. */
  installation: string;
  options: Options;
  report: <
    const MsgId extends MessageId<Messages>
  >(info:
    (
      | (
        MsgId extends string
          ? Messages extends Record<string, string>
            ? MsgId extends keyof Messages
              ? {
                data: Record<ExtractVariables<Messages[MsgId]>, string> extends infer Data
                  ? keyof Data extends never
                    ? never
                    : Data
                  : never;
                id: MsgId;
                fix?: string;
                warnings?: (Warning | undefined)[] | undefined;
              }
              : never
            : never
          : never
        )
      | {
        fix?: string;
        message?: string;
        warnings?: (Warning<Options> | undefined)[] | undefined;
      }
    ) & {
      range: [number, number];
    }

  ) => void;
  /** The Tailwind CSS Version. */
  version: Version;
}

export type Context<Rule extends ESLintRule = ESLintRule> = RuleContext<Rule["messages"], Rule["options"]>;

export type MessageId<Messages extends Record<string, any> | undefined> = Messages extends Record<string, any>
  ? keyof Messages
  : never;

type Trim<Content extends string> =
  Content extends ` ${infer Rest}` ? Trim<Rest>
    : Content extends `${infer Rest} ` ? Trim<Rest>
      : Content;

export type ExtractVariables<Template extends string> =
  Template extends `${string}{{${infer RawVariable}}}${infer Rest}`
    ? ExtractVariables<Rest> | Trim<RawVariable>
    : never;
