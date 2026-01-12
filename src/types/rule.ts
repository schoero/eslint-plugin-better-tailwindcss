import type { JSRuleDefinition } from "eslint";
import type { BaseIssue, BaseSchema, Default, InferOutput, ObjectSchema, OptionalSchema } from "valibot";

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

export type Schema = ObjectSchema<Record<string, OptionalSchema<BaseSchema<unknown, unknown, BaseIssue<unknown>>, Default<BaseSchema<unknown, unknown, BaseIssue<unknown>>, undefined>>>, undefined>;
export type JsonSchema<RawSchema extends Schema> = InferOutput<RawSchema>;

export interface CreateRuleOptions<
  Messages extends Record<string, string>,
  OptionsSchema extends Schema = Schema,
  Options extends Record<string, any> = CommonOptions & JsonSchema<OptionsSchema>
> {
  /** Whether the rule should automatically fix problems. */
  autofix: boolean;
  /** The category of the rule. */
  category: "correctness" | "stylistic";
  /** A brief description of the rule. */
  description: string;
  /** The URL to the rule documentation. */
  docs: string;
  /** Lint the literals in the given context. */
  lintLiterals: (ctx: RuleContext<Messages, Options>, literals: Literal[]) => void;
  /** The name of the rule. */
  name: string;
  /** Whether the rule is enabled in the recommended configs. */
  recommended: boolean;
  initialize?: (ctx: RuleContext<Messages, Options>) => void;
  /** The messages for the rule. */
  messages?: Messages;
  /** The schema for the rule options. */
  schema?: OptionsSchema;
}

export interface ESLintRule<
  Messages extends Record<string, string> = Record<string, string>,
  Options extends Record<string, any> = Record<string, any>
> {
  messages: Messages | undefined;
  name: string;
  get options(): Options;
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
                warnings?: (Warning | undefined)[];
              }
              : never
            : never
          : never
        )
      | {
        fix?: string;
        message?: string;
        warnings?: (Warning<Options> | undefined)[];
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
