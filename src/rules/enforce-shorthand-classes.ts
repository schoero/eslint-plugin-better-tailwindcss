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
  VARIABLE_SCHEMA
} from "better-tailwindcss:options/descriptions.js";
import { getCommonOptions } from "better-tailwindcss:utils/options.js";
import { escapeNestedQuotes } from "better-tailwindcss:utils/quotes.js";
import { createRuleListener } from "better-tailwindcss:utils/rule.js";
import {
  augmentMessageWithWarnings,
  display,
  replacePlaceholders,
  splitClasses
} from "better-tailwindcss:utils/utils.js";

import type { Rule } from "eslint";

import type { Literal } from "better-tailwindcss:types/ast.js";
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
      shorthands?: Shorthands;
      tailwindConfig?: string;
    }
  >
];

export type Shorthands = [classes: string[], shorthand: string[]][][];

export const shorthandGroups = [
  [
    [["(.*)w-(.*)", "(.*)h-(.*)"], ["$1size-$2"]]
  ],
  [
    [["(.*)ml-(.*)", "(.*)mr-(.*)", "(.*)mt-(.*)", "(.*)mb-(.*)"], ["$1m-$2"]],
    [["(.*)mx-(.*)", "(.*)my-(.*)"], ["$1m-$2"]],
    [["(.*)ms-(.*)", "(.*)me-(.*)"], ["$1mx-$2"]],
    [["(.*)ml-(.*)", "(.*)mr-(.*)"], ["$1mx-$2"]],
    [["(.*)mt-(.*)", "(.*)mb-(.*)"], ["$1my-$2"]]
  ],
  [
    [["(.*)pl-(.*)", "(.*)pr-(.*)", "(.*)pt-(.*)", "(.*)pb-(.*)"], ["$1p-$2"]],
    [["(.*)px-(.*)", "(.*)py-(.*)"], ["$1p-$2"]],
    [["(.*)ps-(.*)", "(.*)pe-(.*)"], ["$1px-$2"]],
    [["(.*)pl-(.*)", "(.*)pr-(.*)"], ["$1px-$2"]],
    [["(.*)pt-(.*)", "(.*)pb-(.*)"], ["$1py-$2"]]
  ],
  [
    [["(.*)border-t-(.*)", "(.*)border-b-(.*)", "(.*)border-l-(.*)", "(.*)border-r-(.*)"], ["$1border-$2"]],
    [["(.*)border-x-(.*)", "(.*)border-y-(.*)"], ["$1border-$2"]],
    [["(.*)border-s-(.*)", "(.*)border-e-(.*)"], ["$1border-x-$2"]],
    [["(.*)border-l-(.*)", "(.*)border-r-(.*)"], ["$1border-x-$2"]],
    [["(.*)border-t-(.*)", "(.*)border-b-(.*)"], ["$1border-y-$2"]]
  ],
  [
    [["(.*)border-spacing-x-(.*)", "(.*)border-spacing-y-(.*)"], ["$1border-spacing-$2"]]
  ],
  [
    [["(.*)rounded-tl-(.*)", "(.*)rounded-tr-(.*)", "(.*)rounded-bl-(.*)", "(.*)rounded-br-(.*)"], ["$1rounded-$2"]],
    [["(.*)rounded-tl-(.*)", "(.*)rounded-tr-(.*)"], ["$1rounded-t-$2"]],
    [["(.*)rounded-bl-(.*)", "(.*)rounded-br-(.*)"], ["$1rounded-b-$2"]],
    [["(.*)rounded-tl-(.*)", "(.*)rounded-bl-(.*)"], ["$1rounded-l-$2"]],
    [["(.*)rounded-tr-(.*)", "(.*)rounded-br-(.*)"], ["$1rounded-r-$2"]]
  ],
  [
    [["(.*)scroll-mt-(.*)", "(.*)scroll-mb-(.*)", "(.*)scroll-ml-(.*)", "(.*)scroll-mr-(.*)"], ["$1scroll-m-$2"]],
    [["(.*)scroll-mx-(.*)", "(.*)scroll-my-(.*)"], ["$1scroll-m-$2"]],
    [["(.*)scroll-ms-(.*)", "(.*)scroll-me-(.*)"], ["$1scroll-mx-$2"]],
    [["(.*)scroll-ml-(.*)", "(.*)scroll-mr-(.*)"], ["$1scroll-mx-$2"]],
    [["(.*)scroll-mt-(.*)", "(.*)scroll-mb-(.*)"], ["$1scroll-my-$2"]]
  ],
  [
    [["(.*)scroll-pt-(.*)", "(.*)scroll-pb-(.*)", "(.*)scroll-pl-(.*)", "(.*)scroll-pr-(.*)"], ["$1scroll-p-$2"]],
    [["(.*)scroll-px-(.*)", "(.*)scroll-py-(.*)"], ["$1scroll-p-$2"]],
    [["(.*)scroll-pl-(.*)", "(.*)scroll-pr-(.*)"], ["$1scroll-px-$2"]],
    [["(.*)scroll-ps-(.*)", "(.*)scroll-pe-(.*)"], ["$1scroll-px-$2"]],
    [["(.*)scroll-pt-(.*)", "(.*)scroll-pb-(.*)"], ["$1scroll-py-$2"]]
  ],
  [
    [["(.*)top-(.*)", "(.*)right-(.*)", "(.*)bottom-(.*)", "(.*)left-(.*)"], ["$1inset-$2"]],
    [["(.*)inset-x-(.*)", "(.*)inset-y-(.*)"], ["$1inset-$2"]]
  ],
  [
    [["(.*)divide-x-(.*)", "(.*)divide-y-(.*)"], ["$1divide-$2"]]
  ],
  [
    [["(.*)space-x-(.*)", "(.*)space-y-(.*)"], ["$1space-$2"]]
  ],
  [
    [["(.*)gap-x-(.*)", "(.*)gap-y-(.*)"], ["$1gap-$2"]]
  ],
  [
    [["(.*)translate-x-(.*)", "(.*)translate-y-(.*)", "(.*)translate-z-(.*)"], ["$1translate-$2", "$1translate-3d"]],
    [["(.*)translate-x-(.*)", "(.*)translate-y-(.*)"], ["$1translate-$2"]]
  ],
  [
    [["(.*)rotate-x-(.*)", "(.*)rotate-y-(.*)"], ["$1rotate-$2"]]
  ],
  [
    [["(.*)skew-x-(.*)", "(.*)skew-y-(.*)"], ["$1skew-$2"]]
  ],
  [
    [["(.*)scale-x-(.*)", "(.*)scale-y-(.*)", "(.*)scale-z-(.*)"], ["$1scale-$2", "$1scale-3d"]],
    [["(.*)scale-x-(.*)", "(.*)scale-y-(.*)"], ["$1scale-$2"]]
  ],
  [
    [["(.*)content-(.*)", "(.*)justify-content-(.*)"], ["$1place-content-$2"]],
    [["(.*)items-(.*)", "(.*)justify-items-(.*)"], ["$1place-items-$2"]],
    [["(.*)self-(.*)", "(.*)justify-self-(.*)"], ["$1place-self-$2"]]
  ],
  [
    [["(.*)overflow-hidden", "(.*)text-ellipsis", "(.*)whitespace-nowrap"], ["$1truncate"]]
  ]
] satisfies Shorthands;

const defaultOptions = {
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  tags: DEFAULT_TAG_NAMES,
  variables: DEFAULT_VARIABLE_NAMES
} as const satisfies Options[0];

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/prefer-shorthand.md";

export const enforceShorthandClasses: ESLintRule<Options> = {
  name: "enforce-shorthand-classes" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions(ctx), lintLiterals),
    meta: {
      docs: {
        description: "Enforce shorthand class names instead of longhand class names.",
        recommended: false,
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
            ...TAILWIND_CONFIG_SCHEMA
          },
          type: "object"
        }
      ],
      type: "problem"
    }
  }
};

function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {

  for(const literal of literals){

    const classes = splitClasses(literal.content);

    const shorthandClasses = getShorthandClasses(classes);

    for(const [longhands, shorthands] of shorthandClasses){
      const finalClasses: string[] = [];

      for(const className of classes){

        if(!longhands.includes(className)){
          finalClasses.push(className);
          continue;
        }

        if(shorthands.some(shorthand => finalClasses.includes(shorthand))){
          continue;
        }

        finalClasses.push(...shorthands);
      }

      const escapedClasses = escapeNestedQuotes(
        finalClasses.join(" "),
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
          longhand: display(longhands.join(", ")),
          shorthand: display(shorthands.join(", "))
        },
        fix(fixer) {
          return fixer.replaceTextRange(literal.range, fixedClasses);
        },
        loc: literal.loc,
        message: augmentMessageWithWarnings(
          "Non shorthand class detected. Expected {{ longhand }} to be {{ shorthand }}",
          DOCUMENTATION_URL
        )
      });
    }
  }
}

type Shorthand = [classNames: string[], shorthands: string[]];

function getShorthandClasses(classes: string[]): Shorthand[] {

  let finalShorthandClasses: Shorthand[] = [];

  const maxIterations = shorthandGroups.reduce((acc, shortHandGroups) => {
    if(acc >= shortHandGroups.length){
      return acc;
    }
    return shortHandGroups.length;
  }, 0);

  for(let i = 0; i < maxIterations; i++){
    const shorthandClasses: Shorthand[] = [];

    shorthandGroupLoop: for(const shorthandGroup of shorthandGroups){

      const sortedShorthandGroup = shorthandGroup.sort((a, b) => b[0].length - a[0].length);

      shorthandLoop: for(const [classPatterns, substitutes] of sortedShorthandGroup){

        const longhands: string[] = [];
        const groups: string[] = [];

        for(const classPattern of classPatterns){
          classNameLoop: for(const className of classes){
            const match = className.match(new RegExp(classPattern));

            if(!match){
              continue classNameLoop;
            }

            for(let m = 0; m < match.length; m++){
              if(groups[m] === undefined){
                groups[m] = match[m];
                continue;
              }

              if(m === 0){
                continue;
              }

              if(groups[m] !== match[m]){
                continue shorthandLoop;
              }
            }

            longhands.push(className);
          }
        }

        if(longhands.length === classPatterns.length){
          shorthandClasses.push([longhands, substitutes.map(substitute => replacePlaceholders(substitute, groups))]);
          continue shorthandGroupLoop;
        }
      }

    }

    if(shorthandClasses.length === finalShorthandClasses.length && shorthandClasses.every((shorthand, index) => shorthand[0].length === finalShorthandClasses[index][0].length &&
      shorthand[1].length === finalShorthandClasses[index][1].length)){
      break;
    }

    finalShorthandClasses = structuredClone(shorthandClasses);
  }

  return finalShorthandClasses;
}

export function getOptions(ctx: Rule.RuleContext) {
  return getCommonOptions(ctx);
}
