import { getExactClassLocation, splitClasses, splitWhitespaces } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Context, MessageId } from "better-tailwindcss:types/rule.js";


export function lintClasses<const Ctx extends Context, const MsgId = MessageId<Ctx>>(
  ctx: Ctx,
  literal: Literal,
  report: (className: string, index: number, after: string[]) => false | undefined | {
    data?: Record<string, string>;
    fix?: string;
    message?: string;
  } | {
    messageId: MsgId;
    data?: Record<string, string>;
    fix?: string;
  }
): void {

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

    if(result === undefined || result === false){
      continue;
    }

    const [literalStart] = literal.range;

    if(typeof result === "object" && result.fix !== undefined){
      after[classIndex] = result.fix;
    }

    ctx.report({
      data: result.data,
      loc: getExactClassLocation(literal, startIndex, endIndex),
      message: `Expected ${className} to be ${result.fix ?? ""}.`,
      ..."message" in result && { message: result.message, messageId: undefined },
      ..."messageId" in result && { message: undefined, messageId: result.messageId },
      ...typeof result === "object" && result.fix !== undefined &&
      {
        fix: fixer => fixer.replaceTextRange(
          [
            literalStart + startIndex + 1,
            literalStart + endIndex + 1
          ],
          result.fix!
        )
      }
    });

  }

}
