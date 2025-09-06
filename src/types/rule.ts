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
  options: Options;
  report: <
    const MessageId extends Messages extends Record<string, string>
      ? keyof Messages & string
      : undefined,
    const Message extends string = Messages extends Record<string, string>
      ? MessageId extends keyof Messages
        ? Messages[MessageId]
        : never
      : never
  >(info: (
    | { id: MessageId; }
    | { message?: Message; }) &
    {
      range: [number, number];
      data?: ExtractVariables<Message> extends infer Variables extends string
        ? Record<Variables, string>
        : never;
      fix?: string;
    }
  ) => void;
}

export type Context<Rule extends ESLintRule = ESLintRule> = RuleContext<Rule["messages"], Rule["options"]>;


export type Messages<Ctx extends Context> = Parameters<Ctx["report"]>[0]["data"];

export type MessageId<Ctx extends Context> = Parameters<Ctx["report"]>[0] extends infer Obj
  ? Obj extends { id: any; }
    ? Obj["id"]
    : never
  : never;

type Trim<Content extends string> =
  Content extends ` ${infer Rest}` ? Trim<Rest>
    : Content extends `${infer Rest} ` ? Trim<Rest>
      : Content;

export type ExtractVariables<Template extends string> =
  Template extends `${string}{{${infer RawVariable}}}${infer Rest}`
    ? ExtractVariables<Rest> | Trim<RawVariable>
    : never;
