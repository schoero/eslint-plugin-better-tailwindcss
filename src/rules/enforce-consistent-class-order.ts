import {
  DEFAULT_ATTRIBUTE_NAMES,
  DEFAULT_CALLEE_NAMES,
  DEFAULT_TAG_NAMES,
  DEFAULT_VARIABLE_NAMES
} from "better-tailwindcss:options/default-options.js";
import {
  ATTRIBUTE_SCHEMA,
  CALLEE_SCHEMA,
  ENTRYPOINT_SCHEMA,
  TAG_SCHEMA,
  TAILWIND_CONFIG_SCHEMA,
  TSCONFIG_SCHEMA,
  VARIABLE_SCHEMA
} from "better-tailwindcss:options/descriptions.js";
import { createGetClassOrder } from "better-tailwindcss:tailwindcss/class-order.js";
import { createGetDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { getCommonOptions } from "better-tailwindcss:utils/options.js";
import { escapeNestedQuotes } from "better-tailwindcss:utils/quotes.js";
import { createRuleListener } from "better-tailwindcss:utils/rule.js";
import {
  augmentMessageWithWarnings,
  display,
  splitClasses,
  splitWhitespaces
} from "better-tailwindcss:utils/utils.js";

import type { Rule } from "eslint";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Warning } from "better-tailwindcss:types/async.js";
import type {
  AttributeOption,
  CalleeOption,
  ESLintRule,
  TagOption,
  VariableOption
} from "better-tailwindcss:types/rule.js";


export type Options = [
  Partial<
    AttributeOption &
    CalleeOption &
    TagOption &
    VariableOption &
    {
      entryPoint?: string;
      order?: "asc" | "desc" | "improved" | "official";
      tailwindConfig?: string;
      tsconfig?: string;
    }
  >
];

const defaultOptions = {
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  order: "improved",
  tags: DEFAULT_TAG_NAMES,
  variables: DEFAULT_VARIABLE_NAMES
} as const satisfies Options[0];

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-class-order.md";

export const enforceConsistentClassOrder: ESLintRule<Options> = {
  name: "enforce-consistent-class-order" as const,
  rule: {
    create: ctx => createRuleListener(ctx, initialize, getOptions, lintLiterals),
    meta: {
      docs: {
        category: "Stylistic Issues",
        description: "Enforce a consistent order for tailwind classes.",
        recommended: true,
        url: DOCUMENTATION_URL
      },
      fixable: "code",
      schema: [
        {
          additionalProperties: false,
          properties: {
            ...CALLEE_SCHEMA,
            ...ATTRIBUTE_SCHEMA,
            ...VARIABLE_SCHEMA,
            ...TAG_SCHEMA,
            ...ENTRYPOINT_SCHEMA,
            ...TAILWIND_CONFIG_SCHEMA,
            ...TSCONFIG_SCHEMA,
            order: {
              default: defaultOptions.order,
              description: "The algorithm to use when sorting classes.",
              enum: [
                "asc",
                "desc",
                "official",
                "improved"
              ],
              type: "string"
            }
          },
          type: "object"
        }
      ],
      type: "layout"
    }
  }
};

function initialize() {
  createGetClassOrder();
  createGetDissectedClasses();
}

function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {

  for(const literal of literals){

    const classChunks = splitClasses(literal.content);
    const whitespaceChunks = splitWhitespaces(literal.content);

    const unsortableClasses: [string, string] = ["", ""];

    // remove sticky classes
    if(literal.closingBraces && whitespaceChunks[0] === ""){
      whitespaceChunks.shift();
      unsortableClasses[0] = classChunks.shift() ?? "";
    }
    if(literal.openingBraces && whitespaceChunks[whitespaceChunks.length - 1] === ""){
      whitespaceChunks.pop();
      unsortableClasses[1] = classChunks.pop() ?? "";
    }

    const [sortedClassChunks, warnings] = sortClassNames(ctx, classChunks);

    const classes: string[] = [];

    for(let i = 0; i < Math.max(sortedClassChunks.length, whitespaceChunks.length); i++){
      whitespaceChunks[i] && classes.push(whitespaceChunks[i]);
      sortedClassChunks[i] && classes.push(sortedClassChunks[i]);
    }

    const escapedClasses = escapeNestedQuotes(
      [
        unsortableClasses[0],
        ...classes,
        unsortableClasses[1]
      ].join(""),
      literal.openingQuote ?? literal.closingQuote ?? "`"
    );

    const fixedClasses =
      [
        literal.openingQuote ?? "",
        literal.type === "TemplateLiteral" && literal.closingBraces ? literal.closingBraces : "",
        escapedClasses,
        literal.type === "TemplateLiteral" && literal.openingBraces ? literal.openingBraces : "",
        literal.closingQuote ?? ""
      ].join("");

    if(literal.raw === fixedClasses){
      continue;
    }

    ctx.report({
      data: {
        notSorted: display(literal.raw),
        sorted: display(fixedClasses)
      },
      fix(fixer) {
        return fixer.replaceTextRange(literal.range, fixedClasses);
      },
      loc: literal.loc,
      message: augmentMessageWithWarnings(
        "Incorrect class order. Expected\n\n{{ notSorted }}\n\nto be\n\n{{ sorted }}",
        DOCUMENTATION_URL,
        warnings
      )
    });

  }
}

function sortClassNames(ctx: Rule.RuleContext, classes: string[]): [classes: string[], warnings?: (Warning | undefined)[]] {

  const getClassOrder = createGetClassOrder();
  const getDissectedClasses = createGetDissectedClasses();

  const { order, tailwindConfig, tsconfig } = getOptions(ctx);

  if(order === "asc"){
    return [classes.toSorted((a, b) => a.localeCompare(b))];
  }

  if(order === "desc"){
    return [classes.toSorted((a, b) => b.localeCompare(a))];
  }

  const { classOrder, warnings } = getClassOrder({ classes, configPath: tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });
  const { dissectedClasses } = getDissectedClasses({ classes, configPath: tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

  const officiallySortedClasses = classOrder
    .toSorted(([, a], [, z]) => {
      if(a === z){ return 0; }
      if(a === null){ return -1; }
      if(z === null){ return +1; }
      return +(a - z > 0n) - +(a - z < 0n);
    })
    .map(([className]) => className);

  if(order === "official"){
    return [officiallySortedClasses, warnings];
  }

  const groupedByVariant = new Map<string, string[]>();

  for(const className of officiallySortedClasses){
    const dissectedClass = dissectedClasses.find(dissectedClass => dissectedClass.className === className);
    const variants = dissectedClass?.variants.join(":") ?? "";
    groupedByVariant.set(variants, [...groupedByVariant.get(variants) ?? [], className]);
  }

  return [Array.from(groupedByVariant.values()).flat(), warnings];

}


export function getOptions(ctx: Rule.RuleContext) {

  const options: Options[0] = ctx.options[0] ?? {};

  const common = getCommonOptions(ctx);

  const order = options.order ?? defaultOptions.order;

  return {
    ...common,
    order
  };

}
