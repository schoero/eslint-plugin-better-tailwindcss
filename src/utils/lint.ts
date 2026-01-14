import { augmentMessageWithWarnings, splitClasses, splitWhitespaces } from "better-tailwindcss:utils/utils.js";

import type { Literal } from "better-tailwindcss:types/ast.js";
import type { Warning } from "better-tailwindcss:types/async.js";
import type { Context } from "better-tailwindcss:types/rule.js";


type RemoveNeverProperties<ObjectType extends Record<string, any>> = {
  [Key in keyof ObjectType as ObjectType[Key] extends never ? never : Key]: ObjectType[Key]
};

export function lintClasses<
  const Ctx extends Context
>(
  ctx: Ctx,
  literal: Literal,
  report: (className: string, index: number, after: string[]) =>
      | ((
        Parameters<Ctx["report"]>[0] extends infer DataAndId
          ? (
            DataAndId extends Record<"data" | "id", any>
              ? {
                data: DataAndId["data"];
                id: DataAndId["id"];
                fix?: string;
                message?: undefined;
                warnings?: (Warning | undefined)[];
              }
              : never
          )
          : never
      ) extends infer Result extends Record<string, any>
        ? {
          [Key in keyof Result as Result[Key] extends never ? never : Key]: Result[Key]
        }
        : never
      )
      | false
      | undefined
      | {
        message: string;
        fix?: string;
        warnings?: (Warning | undefined)[];
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
      message: augmentMessageWithWarnings(
        `Expected ${className} to be ${result.fix ?? ""}.`,
        ctx.docs,
        result.warnings
      ),
      range: [
        literalStart + startIndex + (literal.openingQuote?.length ?? 0) + (literal.closingBraces?.length ?? 0),
        literalStart + endIndex + (literal.openingQuote?.length ?? 0) + (literal.closingBraces?.length ?? 0)
      ],
      ..."warnings" in result && { warnings: result.warnings },
      ..."data" in result && { data: result.data },
      ..."message" in result && { id: undefined, message: result.message },
      ..."id" in result && { id: result.id, message: undefined },
      ...typeof result === "object" && result.fix !== undefined && { fix: result.fix }
    });

  }

}
