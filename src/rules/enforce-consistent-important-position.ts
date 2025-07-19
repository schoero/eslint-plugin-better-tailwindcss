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
import { augmentMessageWithWarnings, splitClasses } from "better-tailwindcss:utils/utils.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/version.js";

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
      position?: "legacy" | "recommended";
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

const DOCUMENTATION_URL = "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-important-position.md";

export const enforceConsistentImportantPosition: ESLintRule<Options> = {
  name: "enforce-consistent-important-position" as const,
  rule: {
    create: ctx => createRuleListener(ctx, getOptions(ctx), lintLiterals),
    meta: {
      docs: {
        description: "Enforce consistent important position for classes.",
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
            ...TSCONFIG_SCHEMA,
            position: {
              description: "Preferred position for important classes. 'legacy' places the important modifier (!) at the start of the class name, 'recommended' places it at the end.",
              enum: ["legacy", "recommended"],
              type: "string"
            }
          },
          type: "object"
        }
      ],
      type: "problem"
    }
  }
};

function lintLiterals(ctx: Rule.RuleContext, literals: Literal[]) {

  const { position, tailwindConfig, tsconfig } = getOptions(ctx);
  const { major } = getTailwindcssVersion();

  for(const literal of literals){

    const classes = splitClasses(literal.content);

    const { dissectedClasses, warnings } = getDissectedClasses({ classes, configPath: tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

    lintClasses(ctx, literal, (className, index, after) => {
      const dissectedClass = dissectedClasses.find(dissectedClass => dissectedClass.className === className);

      if(!dissectedClass){
        return;
      }

      const [importantAtStart, importantAtEnd] = dissectedClass.important;

      if(!importantAtStart && !importantAtEnd ||
        position === "legacy" && importantAtStart ||
        position === "recommended" && importantAtEnd
      ){
        return;
      }

      if(major <= TailwindcssVersion.V3 && position === "recommended"){
        warnings.push({
          option: "position",
          title: `The "${position}" position is not supported in Tailwind CSS v3`
        });
      }

      const fix = position === "recommended"
        ? buildClass({ ...dissectedClass, important: [false, true] })
        : buildClass({ ...dissectedClass, important: [true, false] });

      return {
        fix,
        message: augmentMessageWithWarnings(
          `Incorrect important position. "${className}" should be "${fix}".`,
          DOCUMENTATION_URL,
          warnings
        )
      };
    });

  }
}

export function getOptions(ctx: Rule.RuleContext) {
  const options: Options[0] = ctx.options[0] ?? {};

  const common = getCommonOptions(ctx);

  const position = options.position ?? (getTailwindcssVersion().major === TailwindcssVersion.V3 ? "legacy" : "recommended");

  return {
    ...common,
    position
  };

}
