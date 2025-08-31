import { description, literal, object, optional, pipe, union } from "valibot";

import {
  DEFAULT_ATTRIBUTE_NAMES,
  DEFAULT_CALLEE_NAMES,
  DEFAULT_TAG_NAMES,
  DEFAULT_VARIABLE_NAMES
} from "better-tailwindcss:options/default-options.js";
import { getDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { buildClass } from "better-tailwindcss:utils/class.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { augmentMessageWithWarnings, splitClasses } from "better-tailwindcss:utils/utils.js";

import type { AttributeOption, CalleeOption, TagOption, VariableOption } from "better-tailwindcss:types/rule.js";


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

export const enforceConsistentImportantPosition = createRule({
  autofix: true,
  category: "stylistic",
  description: "Enforce consistent important position for classes.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-important-position.md",
  name: "enforce-consistent-important-position",
  recommended: false,
  schema: object({
    position: optional(
      pipe(
        union([
          literal("legacy"),
          literal("recommended")
        ]),
        description("Preferred position for important classes. 'legacy' places the important modifier (!) at the start of the class name, 'recommended' places it at the end.")
      ),
      "recommended"
    )
  }),

  lintLiterals(ctx, literals) {

    const [{ position, tailwindConfig, tsconfig }] = ctx.options;

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
            docs,
            warnings
          )
        };
      });

    }
  }
});
