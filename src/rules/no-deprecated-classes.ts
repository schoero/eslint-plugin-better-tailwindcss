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
import { getDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { buildClass } from "better-tailwindcss:utils/class.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { getCommonOptions } from "better-tailwindcss:utils/options.js";
import { createRuleListener } from "better-tailwindcss:utils/rule.js";
import { getTailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { augmentMessageWithWarnings, replacePlaceholders, splitClasses } from "better-tailwindcss:utils/utils.js";

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
      tailwindConfig?: string;
      tsconfig?: string;
    }
  >
];


const defaultOptions = {
  attributes: DEFAULT_ATTRIBUTE_NAMES,
  callees: DEFAULT_CALLEE_NAMES,
  tags: DEFAULT_TAG_NAMES,
  variables: DEFAULT_VARIABLE_NAMES
} as const satisfies Options[0];

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-deprecated-classes.md";

export const noDeprecatedClasses: ESLintRule<Options> = {
  name: "no-deprecated-classes" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions, lintLiterals),
    meta: {
      docs: {
        description: "Disallow the use of deprecated Tailwind CSS classes.",
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
            ...TAILWIND_CONFIG_SCHEMA,
            ...TSCONFIG_SCHEMA
          },
          type: "object"
        }
      ],
      type: "problem"
    }
  }
};

const deprecations = [
  [
    { major: 4, minor: 0 }, [
      [/^shadow$/, "shadow-sm"],
      [/^inset-shadow$/, "inset-shadow-sm"],
      [/^drop-shadow$/, "drop-shadow-sm"],
      [/^blur$/, "blur-sm"],
      [/^backdrop-blur$/, "backdrop-blur-sm"],
      [/^rounded$/, "rounded-sm"],

      [/^bg-opacity-(.*)$/],
      [/^text-opacity-(.*)$/],
      [/^border-opacity-(.*)$/],
      [/^divide-opacity-(.*)$/],
      [/^ring-opacity-(.*)$/],
      [/^placeholder-opacity-(.*)$/],

      [/^flex-shrink-(.*)$/, "shrink-$1"],
      [/^flex-grow-(.*)$/, "grow-$1"],

      [/^overflow-ellipsis$/, "text-ellipsis"],

      [/^decoration-slice$/, "box-decoration-slice"],
      [/^decoration-clone$/, "box-decoration-clone"]
    ]
  ], [
    { major: 4, minor: 1 }, [
      [/^bg-left-top$/, "bg-top-left"],
      [/^bg-left-bottom$/, "bg-bottom-left"],
      [/^bg-right-top$/, "bg-top-right"],
      [/^bg-right-bottom$/, "bg-bottom-right"],
      [/^object-left-top$/, "object-top-left"],
      [/^object-left-bottom$/, "object-bottom-left"],
      [/^object-right-top$/, "object-top-right"],
      [/^object-right-bottom$/, "object-bottom-right"]
    ]
  ]
] satisfies [{ major: number; minor: number; }, [before: RegExp, after?: string][]][];

function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {

  const { tailwindConfig, tsconfig } = getOptions(ctx);
  const { major, minor } = getTailwindcssVersion();

  for(const literal of literals){

    const classes = splitClasses(literal.content);

    const { dissectedClasses, warnings } = getDissectedClasses({ classes, configPath: tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

    lintClasses(ctx, literal, className => {
      const dissectedClass = dissectedClasses.find(dissectedClass => dissectedClass.className === className);

      if(!dissectedClass){
        return;
      }

      for(const [version, deprecation] of deprecations){
        if(major < version.major || major === version.major && minor < version.minor){
          continue;
        }

        for(const [pattern, replacement] of deprecation){
          const match = dissectedClass.base.match(pattern);

          if(!match){
            continue;
          }

          if(!replacement){
            return {
              message: augmentMessageWithWarnings(
                `Class "${className}" is deprecated. Check the tailwindcss documentation for more information: https://tailwindcss.com/docs/upgrade-guide#removed-deprecated-utilities`,
                DOCUMENTATION_URL,
                warnings
              )
            };
          }

          const fix = buildClass({ ...dissectedClass, base: replacePlaceholders(replacement, match) });

          return {
            fix,
            message: augmentMessageWithWarnings(
              `Deprecated class detected. Replace "${className}" with ${fix}.`,
              DOCUMENTATION_URL,
              warnings
            )
          };

        }
      }
    });

  }
}

export function getOptions(ctx: Rule.RuleContext) {
  return getCommonOptions(ctx);
}
