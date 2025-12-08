import { augmentMessageWithWarnings, splitClasses, splitWhitespaces } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context, MessageId, Messages } from "better-tailwindcss:types/rule.js";


export function lintClasses<
  const Ctx extends Context,
  const MsgId extends MessageId<Ctx>,
  const Msgs extends Record<string, string> | undefined = Messages<Ctx>
>(
  ctx: Ctx,
  literal: Literal,
  report: (className: string, index: number, after: string[]) =>
    | (Msgs extends Record<string, string>
      ? {
        id: MsgId;
        data?: Msgs;
        fix?: string;
        message?: undefined;
        warnings?: (Warning | undefined)[];
      } : {
        message: string;
        fix?: string;
        id?: undefined;
        warnings?: (Warning | undefined)[];
      })
      | false
      | undefined
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
      message: augmentMessageWithWarnings(
        `Expected ${className} to be ${result.fix ?? ""}.`,
        ctx.docs,
        result.warnings
      ),
      range: [
        literalStart + startIndex + (literal.openingQuote?.length ?? 0) + (literal.closingBraces?.length ?? 0),
        literalStart + endIndex + (literal.openingQuote?.length ?? 0) + (literal.closingBraces?.length ?? 0)
      ],
      ..."data" in result && { data: result.data },
      ..."message" in result && { id: undefined, message: result.message },
      ..."id" in result && { id: result.id, message: undefined },
      ...typeof result === "object" && result.fix !== undefined && { fix: result.fix }
    });

  }

}
