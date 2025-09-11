import {
  array,
  boolean,
  description,
  object,
  optional,
  pipe,
  string
} from "valibot";

import {
  createGetCustomComponentClasses,
  getCustomComponentClasses
} from "better-tailwindcss:tailwindcss/custom-component-classes.js";
import { createGetPrefix, getPrefix } from "better-tailwindcss:tailwindcss/prefix.js";
import {
  createGetUnregisteredClasses,
  getUnregisteredClasses
} from "better-tailwindcss:tailwindcss/unregistered-classes.js";
import { escapeForRegex } from "better-tailwindcss:utils/escape.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { splitClasses } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Context } from "better-tailwindcss:types/rule.js";


export const noUnregisteredClasses = createRule({
  autofix: true,
  category: "correctness",
  description: "Disallow any css classes that are not registered in tailwindcss.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/no-unregistered-classes.md",
  name: "no-unregistered-classes",
  recommended: false,

  messages: {
    unregistered: "Unregistered class detected: {{ className }}"
  },

  schema: object({
    detectComponentClasses: optional(
      pipe(
        boolean(),
        description("Whether to automatically detect custom component classes from the tailwindcss config.")
      ),
      false
    ),
    ignore: optional(
      pipe(
        array(
          string()
        ),
        description("A list of classes that should be ignored by the rule.")
      ),
      []
    )
  }),

  initialize: ctx => {
    const { detectComponentClasses } = ctx.options;

    createGetPrefix();
    createGetUnregisteredClasses();

    if(detectComponentClasses){
      createGetCustomComponentClasses();
    }
  },

  lintLiterals: (ctx, literals) => lintLiterals(ctx, literals)
});


function lintLiterals(ctx: Context<typeof noUnregisteredClasses>, literals: Literal[]) {

  const { detectComponentClasses, entryPoint, ignore, tailwindConfig, tsconfig } = ctx.options;

  const { prefix, suffix } = getPrefix({ configPath: entryPoint ?? tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

  const ignoredGroups = new RegExp(`^${escapeForRegex(`${prefix}${suffix}`)}group(?:\\/(\\S*))?$`);
  const ignoredPeers = new RegExp(`^${escapeForRegex(`${prefix}${suffix}`)}peer(?:\\/(\\S*))?$`);

  const { customComponentClasses } = detectComponentClasses
    ? getCustomComponentClasses({ configPath: entryPoint ?? tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig })
    : {};

  for(const literal of literals){

    const classes = splitClasses(literal.content);

    const { unregisteredClasses, warnings } = getUnregisteredClasses({ classes, configPath: entryPoint ?? tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

    if(unregisteredClasses.length === 0){
      continue;
    }

    lintClasses(ctx, literal, className => {

      if(!unregisteredClasses.includes(className)){
        return;
      }

      if(
        ignore.some(ignoredClass => className.match(ignoredClass)) ||
        customComponentClasses?.includes(className) ||
        className.match(ignoredGroups) ||
        className.match(ignoredPeers)
      ){
        return;
      }

      return {
        data: {
          className
        },
        id: "unregistered",
        warnings
      };

    });
  }
}
