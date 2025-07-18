import { getExactClassLocation, splitClasses, splitWhitespaces } from "better-tailwindcss:utils/utils.js";

import type { Rule } from "eslint";

import type { Literal } from "better-tailwindcss:types/ast.js";


export function lintClasses(ctx: Rule.RuleContext, literal: Literal, report: (className: string, index: number, after: string[]) => boolean | undefined | { fix?: string; message?: string; }): void {

  const classChunks = splitClasses(literal.content);
  const whitespaceChunks = splitWhitespaces(literal.content);

  const startsWithWhitespace = whitespaceChunks.length > 0 && whitespaceChunks[0] !== "";

  const after = [...classChunks];

  for(let classIndex = 0, stringIndex = 0; classIndex < classChunks.length; classIndex++){

    const className = classChunks[classIndex];

    if(startsWithWhitespace){
      stringIndex += whitespaceChunks[classIndex].length;
    }

    const startIndex = stringIndex;
    const endIndex = stringIndex + className.length;

    stringIndex = endIndex;

    if(!startsWithWhitespace){
      stringIndex += whitespaceChunks[classIndex + 1].length;
    }

    const result = report(className, classIndex, after);

    if(result === undefined || result === false || result === className){
      continue;
    }

    const [literalStart] = literal.range;

    if(typeof result === "object" && result.fix !== undefined){
      after[classIndex] = result.fix;
    }

    ctx.report({
      data: {
        className
      },
      loc: getExactClassLocation(literal, startIndex, endIndex),
      message: typeof result === "object" && result.message
        ? result.message
        : "Expected {{ before }} to be {{ after }}.",
      ...typeof result === "object" && result.fix !== undefined &&
      {
        fix: fixer => fixer.replaceTextRange(
          [
            literalStart + startIndex + 1,
            literalStart + startIndex + className.length + 1
          ],
          result.fix!
        )
      }
    });

  }

}
