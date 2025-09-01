import { description, literal, object, optional, pipe, union } from "valibot";

import { createGetDissectedClasses, getDissectedClasses } from "better-tailwindcss:tailwindcss/dissect-classes.js";
import { buildClass } from "better-tailwindcss:utils/class.js";
import { lintClasses } from "better-tailwindcss:utils/lint.js";
import { getOptions } from "better-tailwindcss:utils/options.js";
import { createRule } from "better-tailwindcss:utils/rule.js";
import { getTailwindcssVersion, TailwindcssVersion } from "better-tailwindcss:utils/tailwindcss.js";
import { splitClasses } from "better-tailwindcss:utils/utils.js";


export const enforceConsistentImportantPosition = createRule({
  autofix: true,
  category: "stylistic",
  description: "Enforce consistent important position for classes.",
  docs: "https://github.com/schoero/eslint-plugin-better-tailwindcss/blob/main/docs/rules/enforce-consistent-important-position.md",
  name: "enforce-consistent-important-position",
  recommended: false,

  messages: {
    position: "Incorrect important position. '{{ className }}' should be '{{ fix }}'."
  },

  schema: object({
    position: optional(
      pipe(
        union([
          literal("legacy"),
          literal("recommended")
        ]),
        description("Preferred position for important classes. 'legacy' places the important modifier (!) at the start of the class name, 'recommended' places it at the end.")
      ),
      getTailwindcssVersion().major <= TailwindcssVersion.V3 ? "legacy" : "recommended"
    )
  }),

  initialize: () => {
    createGetDissectedClasses();
  },

  lintLiterals(ctx, literals) {

    const { entryPoint, position, tailwindConfig, tsconfig } = getOptions(ctx, enforceConsistentImportantPosition);

    const { major } = getTailwindcssVersion();

    for(const literal of literals){

      const classes = splitClasses(literal.content);

      const { dissectedClasses, warnings } = getDissectedClasses({ classes, configPath: entryPoint ?? tailwindConfig, cwd: ctx.cwd, tsconfigPath: tsconfig });

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
          data: { className, fix },
          fix,
          messageId: "position"
        };
      });

    }
  }
});
